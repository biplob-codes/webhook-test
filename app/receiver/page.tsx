"use client";

import { useState, useTransition } from "react";
import { clearEvents, getEvents } from "../action";
import { getBaseUrl } from "@/lib/base-url";
import { WebhookEvent } from "../generated/prisma/client";

const RECEIVER_URL = `${getBaseUrl()}/api/receive`;
export default function ReceiverPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasFetched, setHasFetched] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(RECEIVER_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRefresh() {
    startTransition(async () => {
      const data = await getEvents();
      setEvents(data);
      setHasFetched(true);
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearEvents();
      setEvents([]);
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Webhook Receiver
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Incoming events are stored in PostgreSQL.{" "}
            <a href="/" className="text-indigo-400 hover:underline">
              ← Go to Sender
            </a>
          </p>
        </div>

        {/* Receiver URL */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Receiver Endpoint
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-emerald-400 text-sm font-mono bg-zinc-950 rounded-lg px-3 py-2 border border-zinc-800 overflow-auto whitespace-nowrap">
              {RECEIVER_URL}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors"
          >
            {isPending ? "Loading…" : "↻ Refresh"}
          </button>
          <button
            onClick={handleClear}
            disabled={isPending || events.length === 0}
            className="bg-zinc-800 hover:bg-red-900 hover:text-red-300 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-300 font-semibold rounded-lg px-5 py-2.5 text-sm transition-colors border border-zinc-700"
          >
            Clear All
          </button>
          {hasFetched && (
            <span className="ml-auto text-zinc-500 text-sm self-center">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Events */}
        {hasFetched && events.length === 0 && (
          <div className="text-center text-zinc-500 text-sm py-16 border border-dashed border-zinc-800 rounded-xl">
            No events yet. Send a webhook to the receiver URL above.
          </div>
        )}

        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}

function EventCard({ event }: { event: WebhookEvent }) {
  const [showHeaders, setShowHeaders] = useState(false);

  const ts = new Date(event.createdAt);
  const timeStr = ts.toLocaleTimeString();
  const dateStr = ts.toLocaleDateString();

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-sm font-medium text-zinc-200">{timeStr}</span>
          <span className="text-xs text-zinc-500">{dateStr}</span>
        </div>
        <button
          onClick={() => setShowHeaders((v) => !v)}
          className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          {showHeaders ? "Hide headers ↑" : "Show headers ↓"}
        </button>
      </div>

      {/* Payload */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Payload
        </p>
        <pre className="text-xs text-zinc-300 bg-zinc-950 rounded-lg p-3 border border-zinc-800 overflow-auto max-h-64 whitespace-pre-wrap break-all">
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </div>

      {/* Headers (collapsible) */}
      {showHeaders && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Headers
          </p>
          <pre className="text-xs text-zinc-400 bg-zinc-950 rounded-lg p-3 border border-zinc-800 overflow-auto max-h-48 whitespace-pre-wrap break-all">
            {JSON.stringify(event.headers, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

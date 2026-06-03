"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const DEFAULT_PAYLOAD = JSON.stringify({ message: "Hello, webhook!" }, null, 2);

export default function SenderPage() {
  const [url, setUrl] = useState("http://localhost:3000/api/receive");
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [response, setResponse] = useState<{
    status: number;
    body: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleEditorChange(value: string | undefined) {
    const val = value ?? "";
    setPayload(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  async function handleSend() {
    if (jsonError) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch (e: unknown) {
      setJsonError(e instanceof Error ? e.message : "Invalid JSON");
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // leave as plain text
      }
      setResponse({ status: res.status, body: pretty });
    } catch (err: unknown) {
      setResponse({
        status: 0,
        body: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(false);
    }
  }

  const statusColor =
    response === null
      ? ""
      : response.status >= 200 && response.status < 300
        ? "text-emerald-400"
        : response.status === 0
          ? "text-red-400"
          : "text-yellow-400";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Webhook Sender
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            POST a JSON payload to any URL.{" "}
            <a href="/receiver" className="text-indigo-400 hover:underline">
              → Go to Receiver
            </a>
          </p>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            Destination URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/webhook"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* JSON Editor */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">
            JSON Payload
          </label>
          <div
            className={`rounded-lg overflow-hidden border transition ${
              jsonError ? "border-red-500" : "border-zinc-700"
            }`}
          >
            <MonacoEditor
              height="280px"
              defaultLanguage="json"
              value={payload}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                tabSize: 2,
                wordWrap: "on",
                formatOnPaste: true,
                automaticLayout: true,
              }}
            />
          </div>
          {jsonError && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <span>⚠</span> {jsonError}
            </p>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !!jsonError || !url.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          {loading ? "Sending…" : "Send Webhook"}
        </button>

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300">
                Response
              </span>
              <span className={`text-sm font-bold ${statusColor}`}>
                {response.status === 0 ? "Error" : `HTTP ${response.status}`}
              </span>
            </div>
            <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-300 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {response.body}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}

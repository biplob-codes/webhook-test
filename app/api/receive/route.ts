export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const rawHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    rawHeaders[key] = value;
  });

  await prisma.webhookEvent.create({
    data: {
      payload,
      headers: rawHeaders,
    },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

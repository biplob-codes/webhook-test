"use server";

import prisma from "@/lib/prisma";

export async function getEvents() {
  return prisma.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function clearEvents() {
  await prisma.webhookEvent.deleteMany();
}

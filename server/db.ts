import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { readReplicas } from "@prisma/extension-read-replicas";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Neon WebSocket config for Node.js (once)
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const primaryAdapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });

  const primaryClient = new PrismaClient({
    adapter: primaryAdapter,
    log: ["error"],
  });

  const replicaUrl = process.env.DATABASE_URL_READ_REPLICA?.trim() || "";

  if (replicaUrl) {
    const replicaAdapter = new PrismaNeon({
      connectionString: replicaUrl,
    });

    const replicaClient = new PrismaClient({
      adapter: replicaAdapter,
      log: ["error"],
    });

    return primaryClient.$extends(
      readReplicas({ replicas: [replicaClient] })
    ) as unknown as PrismaClient;
  }

  return primaryClient;
}

export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export async function safeQuery<T>(
  queryFn: () => Promise<T>
): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error) {
    console.error("Database query error:", error);
    return null;
  }
}

export default db;

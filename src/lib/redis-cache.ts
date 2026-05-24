import "server-only";

import Redis from "ioredis";

type CacheGroup = "catalog" | "media" | "settings";

const DEFAULT_TTL_SECONDS = 5 * 60;
const namespace = process.env.CACHE_NAMESPACE || "saptambu";

let redis: Redis | null | undefined;

function getRedis() {
  if (redis !== undefined) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    redis = null;
    return redis;
  }

  redis = new Redis(url, {
    connectTimeout: 500,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });

  redis.on("error", () => {
    // Keep Redis as an opportunistic accelerator. Requests must continue through DB fallback.
  });

  return redis;
}

function cacheKey(key: string) {
  return `${namespace}:${key}`;
}

function reviveDates(_key: string, value: unknown) {
  if (typeof value !== "string") return value;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date;
}

export async function cachedJson<T>(key: string, loader: () => Promise<T>, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const client = getRedis();
  const fullKey = cacheKey(key);

  if (client) {
    try {
      const cached = await client.get(fullKey);
      if (cached) return JSON.parse(cached, reviveDates) as T;
    } catch {
      // Cache failures should not affect public rendering.
    }
  }

  const value = await loader();

  if (client) {
    try {
      await client.set(fullKey, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      // Cache failures should not affect public rendering.
    }
  }

  return value;
}

export async function clearCachePrefixes(prefixes: string[]) {
  const client = getRedis();
  if (!client || prefixes.length === 0) return;

  for (const prefix of prefixes) {
    let cursor = "0";
    const match = cacheKey(prefix);

    do {
      try {
        const [nextCursor, keys] = await client.scan(cursor, "MATCH", `${match}*`, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length) await client.unlink(...keys);
      } catch {
        return;
      }
    } while (cursor !== "0");
  }
}

export async function clearPublicCache(groups: CacheGroup[] = ["catalog", "media", "settings"]) {
  await clearCachePrefixes(groups.map((group) => `${group}:`));
}

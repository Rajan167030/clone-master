const DEFAULT_TTL_SECONDS = 300;

const getUpstashConfig = () => {
  const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim().replace(/\/+$/, "");
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

  if (!url || !token) {
    return null;
  }

  return { url, token };
};

const runRedisCommand = async (command) => {
  const config = getUpstashConfig();

  if (!config) {
    return null;
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!response.ok) {
      console.warn("Redis cache command failed:", response.status, response.statusText);
      return null;
    }

    return response.json();
  } catch (error) {
    console.warn("Redis cache unavailable:", error?.message || error);
    return null;
  }
};

export const getCache = async (key) => {
  const data = await runRedisCommand(["GET", key]);
  const raw = data?.result;

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = DEFAULT_TTL_SECONDS) => {
  await runRedisCommand(["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]);
};

export const deleteCache = async (...keys) => {
  const filteredKeys = keys.filter(Boolean);

  if (filteredKeys.length === 0) {
    return;
  }

  await runRedisCommand(["DEL", ...filteredKeys]);
};

export const deleteCacheByPrefix = async (prefix) => {
  const scan = await runRedisCommand(["SCAN", "0", "MATCH", `${prefix}*`, "COUNT", "100"]);
  const keys = scan?.result?.[1] || [];

  if (keys.length > 0) {
    await deleteCache(...keys);
  }
};

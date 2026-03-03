const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const RETRY_DELAY_MS = 500;

export interface FetchWithRetryOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function fetchWithRetry(
  url: string | URL,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES, ...init } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) return res;
      if (attempt < retries && (res.status >= 500 || res.status === 429)) {
        lastError = new Error(`HTTP ${res.status}: ${res.statusText}`);
      } else {
        return res;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt >= retries) throw lastError;
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  }

  throw lastError ?? new Error("Fetch failed after retries");
}

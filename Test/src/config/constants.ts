export const MAX_HISTORY = 50;
export const MAX_RETRIES = 3;
export const REQUEST_TIMEOUT_MS = 10_000;
export const BASE_RETRY_DELAY_MS = 2_000;
export const DEFAULT_POLLING_INTERVAL = 7;
export const INTERVAL_OPTIONS = [3, 5, 7, 9, 11, 13, 15] as const;

export const API_KEY =
  import.meta.env.VITE_COINGECKO_API_KEY ?? "CG-PMQoKkfkepkXHgW1Cj5tnjkZ";

export const API_URL =
  import.meta.env.VITE_API_URL ??
  "https://api.coingecko.com/api/v3/simple/price";

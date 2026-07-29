import type { CoinGeckoPriceResponse } from "../types/price";
import { API_KEY, API_URL, REQUEST_TIMEOUT_MS } from "../config/constants";

export class RateLimitError extends Error {
  constructor() {
    super("RATE_LIMIT");
    this.name = "RateLimitError";
  }
}

export class InvalidDataError extends Error {
  constructor(message = "Datos inválidos recibidos de la API") {
    super(message);
    this.name = "InvalidDataError";
  }
}

export function parseEthereumPrice(data: unknown): number {
  if (!data || typeof data !== "object") {
    throw new InvalidDataError();
  }

  const response = data as CoinGeckoPriceResponse;
  const price = response.ethereum?.usd;

  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new InvalidDataError("Precio de Ethereum inválido o ausente");
  }

  return price;
}

export async function fetchEthereumPrice(
  signal?: AbortSignal,
): Promise<number> {
  const url = new URL(API_URL);
  url.searchParams.set("vs_currencies", "usd");
  url.searchParams.set("ids", "ethereum");
  url.searchParams.set("x_cg_demo_api_key", API_KEY);

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    REQUEST_TIMEOUT_MS,
  );

  const onAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(url.toString(), {
      signal: timeoutController.signal,
      headers: { Accept: "application/json" },
    });

    if (response.status === 429) {
      throw new RateLimitError();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: unknown = await response.json();
    return parseEthereumPrice(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (signal?.aborted) {
        throw error;
      }
      throw new Error("La petición excedió el tiempo límite", { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}

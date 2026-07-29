import { useCallback, useEffect, useRef, useState } from "react";
import {
  BASE_RETRY_DELAY_MS,
  DEFAULT_POLLING_INTERVAL,
  MAX_HISTORY,
  MAX_RETRIES,
} from "../config/constants";
import {
  fetchEthereumPrice,
  RateLimitError,
} from "../services/coingeckoApi";
import type { PriceData } from "../types/price";

function appendPricePoint(prev: PriceData[], price: number): PriceData[] {
  const now = Date.now();
  const lastEntry = prev.at(-1);

  if (lastEntry && lastEntry.price === price) {
    return prev;
  }

  const next = [...prev, { price, timestamp: now }];
  return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
}

export function useEthereumPricePolling(
  initialInterval = DEFAULT_POLLING_INTERVAL,
) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(initialInterval);

  const isMountedRef = useRef(true);
  const isPausedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const fetchPriceRef = useRef<(isRetry?: boolean) => Promise<void>>(
    async () => {},
  );

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const abortInFlightRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cleanupAll = useCallback(() => {
    abortInFlightRequest();
    clearRetryTimeout();
  }, [abortInFlightRequest, clearRetryTimeout]);

  const scheduleRetry = useCallback(
    (attempt: number, message: string) => {
      clearRetryTimeout();

      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
      setRetryCount(attempt + 1);
      setError(`${message} Reintentando en ${delay / 1000}s...`);

      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && !isPausedRef.current) {
          void fetchPriceRef.current(true);
        }
      }, delay);
    },
    [clearRetryTimeout],
  );

  const fetchPrice = useCallback(async (isRetry = false) => {
    if (isPausedRef.current || !isMountedRef.current) {
      return;
    }

    abortInFlightRequest();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);

      const price = await fetchEthereumPrice(controller.signal);

      if (!isMountedRef.current || isPausedRef.current) {
        return;
      }

      retryCountRef.current = 0;
      setRetryCount(0);
      setCurrentPrice(price);
      setLastUpdated(Date.now());
      setPriceData((prev) => appendPricePoint(prev, price));
      setError(null);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      if (!isMountedRef.current || isPausedRef.current) {
        return;
      }

      const attempt = retryCountRef.current;
      const isRateLimit = err instanceof RateLimitError;
      const isRetryable =
        isRateLimit ||
        (err instanceof Error &&
          (err.message.includes("tiempo límite") ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError")));

      if (isRetryable && attempt < MAX_RETRIES) {
        retryCountRef.current = attempt + 1;
        scheduleRetry(
          attempt,
          isRateLimit
            ? "Límite de peticiones alcanzado."
            : "Error de red o timeout.",
        );
        setLoading(false);
        return;
      }

      setError(
        err instanceof Error ? err.message : "Error al obtener el precio",
      );
      setLoading(false);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [abortInFlightRequest, scheduleRetry]);

  useEffect(() => {
    fetchPriceRef.current = fetchPrice;
  }, [fetchPrice]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;

      if (next) {
        cleanupAll();
      }

      return next;
    });
  }, [cleanupAll]);

  const changePollingInterval = useCallback((seconds: number) => {
    setPollingInterval(seconds);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cleanupAll();
    };
  }, [cleanupAll]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    // Polling inicial y periódico: debe vivir en un effect para respetar pausa/desmontaje.
    void fetchPriceRef.current();

    const intervalId = setInterval(() => {
      void fetchPriceRef.current();
    }, pollingInterval * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isPaused, pollingInterval]);

  return {
    priceData,
    currentPrice,
    lastUpdated,
    isPaused,
    error,
    loading,
    retryCount,
    pollingInterval,
    togglePause,
    changePollingInterval,
  };
}

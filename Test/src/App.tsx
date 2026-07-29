// App.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

// ==================== TIPOS ====================
interface PriceData {
  price: number;
  timestamp: number;
}

interface Stats {
  change: number;
  maxPrice: number;
  minPrice: number;
  averagePrice: number;
  currentPrice: number;
}

// ==================== COMPONENTE DE GRÁFICA DE BARRAS ====================
const BarChart: React.FC<{ data: PriceData[]; maxItems?: number }> = React.memo(
  ({ data, maxItems = 30 }) => {
    const displayData = useMemo(() => {
      if (!data || data.length === 0) return [];
      return data.slice(-maxItems);
    }, [data, maxItems]);

    const maxPrice = useMemo(() => {
      if (displayData.length === 0) return 0;
      return Math.max(...displayData.map((item) => item.price));
    }, [displayData]);

    const minPrice = useMemo(() => {
      if (displayData.length === 0) return 0;
      return Math.min(...displayData.map((item) => item.price));
    }, [displayData]);

    const priceRange = maxPrice - minPrice || 1;

    if (displayData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-400">Esperando datos...</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Historial de Precios (últimos {displayData.length})
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              Mín: ${minPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">
              Máx: ${maxPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="h-64 flex items-end space-x-1.5">
          {displayData.map((item, index) => {
            const height = ((item.price - minPrice) / priceRange) * 100;
            const isLast = index === displayData.length - 1;
            const isFirst = index === 0;

            // Color dinámico basado en el cambio de precio
            let barColor = "bg-blue-400";
            if (!isFirst) {
              const prevPrice = displayData[index - 1].price;
              if (item.price > prevPrice) barColor = "bg-green-500";
              else if (item.price < prevPrice) barColor = "bg-red-500";
            }

            return (
              <div
                key={item.timestamp}
                className={`flex-1 transition-all duration-500 rounded-t ${
                  isLast ? "bg-blue-600 ring-2 ring-blue-300" : barColor
                }`}
                style={{
                  height: `${Math.max(height, 3)}%`,
                  minHeight: "4px",
                }}
                title={`$${item.price.toFixed(2)} - ${new Date(item.timestamp).toLocaleTimeString()}`}
              >
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="relative -mt-6 text-xs text-center text-gray-700 font-medium">
                    ${item.price.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Línea de precio actual */}
        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>
            {displayData[0]
              ? new Date(displayData[0].timestamp).toLocaleTimeString()
              : "--:--"}
          </span>
          <span className="text-blue-600 font-medium">
            ${displayData[displayData.length - 1]?.price.toFixed(2) || "0.00"}
          </span>
          <span>
            {displayData[displayData.length - 1]
              ? new Date(
                  displayData[displayData.length - 1].timestamp,
                ).toLocaleTimeString()
              : "--:--"}
          </span>
        </div>
      </div>
    );
  },
);

BarChart.displayName = "BarChart";

// ==================== COMPONENTE DE ESTADÍSTICAS ====================
const StatsCards: React.FC<{ stats: Stats | null }> = React.memo(
  ({ stats }) => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 transition-all hover:shadow-xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Precio Actual
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            ${stats.currentPrice.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 transition-all hover:shadow-xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Cambio Total
          </p>
          <p
            className={`text-xl font-bold mt-1 ${stats.change >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {stats.change >= 0 ? "+" : ""}
            {stats.change.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 transition-all hover:shadow-xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Máximo
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            ${stats.maxPrice.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 transition-all hover:shadow-xl">
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            Mínimo
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            ${stats.minPrice.toFixed(2)}
          </p>
        </div>
      </div>
    );
  },
);

StatsCards.displayName = "StatsCards";

// ==================== COMPONENTE PRINCIPAL ====================
const App: React.FC = () => {
  // ==================== REFS ====================
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const isPausedRef = useRef<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== STATE ====================
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [pollingInterval, setPollingInterval] = useState<number>(7); // segundos

  // ==================== CONSTANTES ====================
  const MAX_HISTORY = 50;
  const MAX_RETRIES = 3;
  const API_KEY =
    process.env.REACT_APP_COINGECKO_API_KEY || "CG-PMQoKkfkepkXHgW1Cj5tnjkZ";
  const API_URL =
    process.env.REACT_APP_API_URL ||
    "https://api.coingecko.com/api/v3/simple/price";

  const INTERVAL_OPTIONS = [7, 9, 11, 13, 15];

  // ==================== FUNCIÓN DE FETCH ====================
  const fetchPrice = useCallback(
    async (isRetry: boolean = false) => {
      // Si está pausado, no hacer la petición
      if (isPausedRef.current) {
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setError(null);
        if (!isRetry) {
          setLoading(true);
        }

        const url = new URL(API_URL);
        url.searchParams.append("vs_currencies", "usd");
        url.searchParams.append("ids", "ethereum");
        url.searchParams.append("x_cg_demo_api_key", API_KEY);

        const response = await fetch(url.toString(), {
          signal: abortControllerRef.current.signal,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!isMountedRef.current) return;

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("RATE_LIMIT");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data?.ethereum?.usd) {
          throw new Error("Datos inválidos recibidos");
        }

        const newPrice = data.ethereum.usd;
        const now = Date.now();

        if (isMountedRef.current) {
          setCurrentPrice(newPrice);
          setLastUpdated(now);
          setRetryCount(0);
          setError(null);
          setLoading(false);

          setPriceData((prev) => {
            // Verificar si el precio ya existe para evitar duplicados
            const lastEntry = prev[prev.length - 1];
            if (lastEntry && lastEntry.price === newPrice) {
              return prev;
            }

            const newHistory = [...prev, { price: newPrice, timestamp: now }];
            if (newHistory.length > MAX_HISTORY) {
              return newHistory.slice(-MAX_HISTORY);
            }
            return newHistory;
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (!isMountedRef.current) return;

        console.error("Error fetching price:", error);

        if (
          error instanceof Error &&
          error.message === "RATE_LIMIT" &&
          retryCount < MAX_RETRIES
        ) {
          const delay = 2000 * Math.pow(2, retryCount);
          setRetryCount((prev) => prev + 1);

          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !isPausedRef.current) {
              fetchPrice(true);
            }
          }, delay);

          setError(`Límite de peticiones. Reintentando en ${delay / 1000}s...`);
          return;
        }

        setError(
          error instanceof Error ? error.message : "Error al obtener el precio",
        );
        setLoading(false);
      }
    },
    [API_URL, API_KEY, retryCount, MAX_RETRIES],
  );

  // ==================== FUNCIÓN DE PAUSA ====================
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const newState = !prev;
      isPausedRef.current = newState;

      if (newState) {
        // PAUSAR
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      } else {
        // REANUDAR
        const intervalMs = pollingInterval * 1000;
        fetchPrice();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          fetchPrice();
        }, intervalMs);
      }

      return newState;
    });
  }, [fetchPrice, pollingInterval]);

  // ==================== FUNCIÓN DE CAMBIO DE INTERVALO ====================
  const handleIntervalChange = useCallback(
    (seconds: number) => {
      setPollingInterval(seconds);

      // Si no está pausado, reiniciar el intervalo
      if (!isPausedRef.current) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        const intervalMs = seconds * 1000;
        intervalRef.current = setInterval(() => {
          fetchPrice();
        }, intervalMs);
      }
    },
    [fetchPrice],
  );

  // ==================== EFECTO PRINCIPAL ====================
  useEffect(() => {
    isMountedRef.current = true;
    isPausedRef.current = false;

    // Obtener datos iniciales
    fetchPrice();

    // Configurar intervalo
    const intervalMs = pollingInterval * 1000;
    intervalRef.current = setInterval(() => {
      fetchPrice();
    }, intervalMs);

    // Cleanup
    return () => {
      isMountedRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [fetchPrice, pollingInterval]);

  // ==================== CÁLCULO DE ESTADÍSTICAS ====================
  const stats = useMemo<Stats | null>(() => {
    if (!priceData || priceData.length === 0 || currentPrice === null) {
      return null;
    }

    const prices = priceData.map((item) => item.price);
    const initialPrice = prices[0];
    const change = ((currentPrice - initialPrice) / initialPrice) * 100;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    return {
      change,
      maxPrice,
      minPrice,
      averagePrice,
      currentPrice,
    };
  }, [priceData, currentPrice]);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>💰</span> Ethereum Price Tracker
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Datos en tiempo real desde CoinGecko API
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de intervalo */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="interval"
                  className="text-sm text-gray-600 font-medium"
                >
                  ⏱️ Intervalo:
                </label>
                <select
                  id="interval"
                  value={pollingInterval}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isPaused}
                >
                  {INTERVAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} segundos
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón de pausa */}
              <button
                onClick={togglePause}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  isPaused
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200"
                }`}
                aria-label={
                  isPaused
                    ? "Reanudar actualizaciones"
                    : "Pausar actualizaciones"
                }
              >
                {isPaused ? "▶️ Reanudar" : "⏸️ Pausa de Emergencia"}
              </button>
            </div>
          </div>

          {/* Estado y mensajes */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {loading && !currentPrice && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cargando...
              </span>
            )}

            {isPaused && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                ⏸️ Actualizaciones pausadas
              </span>
            )}

            {error && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                ⚠️ {error}
              </span>
            )}

            {lastUpdated && !isPaused && !error && (
              <span className="text-xs text-gray-400">
                Última actualización:{" "}
                {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Precio actual grande */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Precio ETH/USD
              </p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mt-1">
                ${currentPrice?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${!isPaused && !error ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}
              />
              <span className="text-sm text-gray-500">
                {!isPaused && !error
                  ? "🟢 En vivo"
                  : isPaused
                    ? "⏸️ Pausado"
                    : "🔴 Error"}
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <StatsCards stats={stats} />

        {/* Gráfica de barras */}
        <BarChart data={priceData} maxItems={30} />

        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 gap-2">
            <span>📊 Puntos en historial: {priceData.length}</span>
            <span>🔄 Actualización cada: {pollingInterval} segundos</span>
            <span>
              🔑 API Key: {API_KEY ? "✅ Configurada" : "❌ No configurada"}
            </span>
            <span>
              📈 Intervalos disponibles: {INTERVAL_OPTIONS.join(", ")}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

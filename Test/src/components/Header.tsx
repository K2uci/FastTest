import { memo } from "react";
import { INTERVAL_OPTIONS } from "../config/constants";
import { StatusBadges } from "./StatusBadges";

interface HeaderProps {
  pollingInterval: number;
  isPaused: boolean;
  loading: boolean;
  currentPrice: number | null;
  error: string | null;
  lastUpdated: number | null;
  onIntervalChange: (seconds: number) => void;
  onTogglePause: () => void;
}

function HeaderComponent({
  pollingInterval,
  isPaused,
  loading,
  currentPrice,
  error,
  lastUpdated,
  onIntervalChange,
  onTogglePause,
}: HeaderProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <span>💰</span> Ethereum Price Tracker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Datos en tiempo real desde CoinGecko API
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="interval" className="text-sm font-medium text-gray-600">
              ⏱️ Intervalo:
            </label>
            <select
              id="interval"
              value={pollingInterval}
              onChange={(event) => onIntervalChange(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isPaused}
            >
              {INTERVAL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} segundos
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onTogglePause}
            className={`rounded-lg px-4 py-2 font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 ${
              isPaused
                ? "bg-green-500 shadow-lg shadow-green-200 hover:bg-green-600"
                : "bg-red-500 shadow-lg shadow-red-200 hover:bg-red-600"
            }`}
            aria-label={
              isPaused ? "Reanudar actualizaciones" : "Pausar actualizaciones"
            }
          >
            {isPaused ? "▶️ Reanudar" : "⏸️ Pausa de Emergencia"}
          </button>
        </div>
      </div>

      <StatusBadges
        loading={loading}
        currentPrice={currentPrice}
        isPaused={isPaused}
        error={error}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}

export const Header = memo(HeaderComponent);

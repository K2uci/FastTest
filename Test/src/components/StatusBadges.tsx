import { memo } from "react";

interface StatusBadgesProps {
  loading: boolean;
  currentPrice: number | null;
  isPaused: boolean;
  error: string | null;
  lastUpdated: number | null;
}

function StatusBadgesComponent({
  loading,
  currentPrice,
  isPaused,
  error,
  lastUpdated,
}: StatusBadgesProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      {loading && currentPrice === null && (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
          <svg
            className="-ml-1 mr-2 h-4 w-4 animate-spin text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
          ⏸️ Actualizaciones pausadas
        </span>
      )}

      {error && (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
          ⚠️ {error}
        </span>
      )}

      {lastUpdated && !isPaused && !error && (
        <span className="text-xs text-gray-400">
          Última actualización: {new Date(lastUpdated).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

export const StatusBadges = memo(StatusBadgesComponent);

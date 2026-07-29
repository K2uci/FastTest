import { memo } from "react";

interface PriceDisplayProps {
  currentPrice: number | null;
  isPaused: boolean;
  hasError: boolean;
}

function PriceDisplayComponent({
  currentPrice,
  isPaused,
  hasError,
}: PriceDisplayProps) {
  const isLive = !isPaused && !hasError;

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-gray-500">
            Precio ETH/USD
          </p>
          <p className="mt-1 text-4xl font-bold text-gray-900 md:text-5xl">
            ${currentPrice?.toFixed(2) ?? "0.00"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              isLive ? "animate-pulse bg-green-400" : "bg-yellow-400"
            }`}
          />
          <span className="text-sm text-gray-500">
            {isLive ? "🟢 En vivo" : isPaused ? "⏸️ Pausado" : "🔴 Error"}
          </span>
        </div>
      </div>
    </div>
  );
}

export const PriceDisplay = memo(PriceDisplayComponent);

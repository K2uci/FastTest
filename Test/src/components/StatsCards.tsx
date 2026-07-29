import { memo } from "react";
import type { PriceStats } from "../types/price";

interface StatsCardsProps {
  stats: PriceStats | null;
}

function StatsCardsComponent({ stats }: StatsCardsProps) {
  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="rounded-lg bg-white p-4 shadow-lg transition-all hover:shadow-xl">
        <p className="text-xs uppercase tracking-wider text-gray-500">Precio actual</p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          ${stats.currentPrice.toFixed(2)}
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-lg transition-all hover:shadow-xl">
        <p className="text-xs uppercase tracking-wider text-gray-500">Cambio total</p>
        <p
          className={`mt-1 text-xl font-bold ${
            stats.change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {stats.change >= 0 ? "+" : ""}
          {stats.change.toFixed(2)}%
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-lg transition-all hover:shadow-xl">
        <p className="text-xs uppercase tracking-wider text-gray-500">Máximo</p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          ${stats.maxPrice.toFixed(2)}
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-lg transition-all hover:shadow-xl">
        <p className="text-xs uppercase tracking-wider text-gray-500">Mínimo</p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          ${stats.minPrice.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export const StatsCards = memo(StatsCardsComponent);

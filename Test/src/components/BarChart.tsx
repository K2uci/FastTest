import { memo, useMemo } from "react";
import type { PriceData } from "../types/price";

interface BarChartProps {
  data: PriceData[];
  maxItems?: number;
}

function BarChartComponent({ data, maxItems = 30 }: BarChartProps) {
  const displayData = useMemo(
    () => (data.length === 0 ? [] : data.slice(-maxItems)),
    [data, maxItems],
  );

  const { maxPrice, minPrice } = useMemo(() => {
    if (displayData.length === 0) {
      return { maxPrice: 0, minPrice: 0 };
    }

    const prices = displayData.map((item) => item.price);
    return {
      maxPrice: Math.max(...prices),
      minPrice: Math.min(...prices),
    };
  }, [displayData]);

  const priceRange = maxPrice - minPrice || 1;

  if (displayData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-gray-50">
        <p className="text-gray-400">Esperando datos...</p>
      </div>
    );
  }

  const firstItem = displayData[0];
  const lastItem = displayData[displayData.length - 1];

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">
          Historial de precios (últimos {displayData.length})
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Mín: ${minPrice.toFixed(2)}</span>
          <span className="text-xs text-gray-400">Máx: ${maxPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex h-64 items-end space-x-1.5">
        {displayData.map((item, index) => {
          const height = ((item.price - minPrice) / priceRange) * 100;
          const isLast = index === displayData.length - 1;
          const isFirst = index === 0;

          let barColor = "bg-blue-400";
          if (!isFirst) {
            const prevPrice = displayData[index - 1].price;
            if (item.price > prevPrice) barColor = "bg-green-500";
            else if (item.price < prevPrice) barColor = "bg-red-500";
          }

          return (
            <div
              key={item.timestamp}
              className={`flex-1 rounded-t transition-all duration-500 ${
                isLast ? "bg-blue-600 ring-2 ring-blue-300" : barColor
              }`}
              style={{
                height: `${Math.max(height, 3)}%`,
                minHeight: "4px",
              }}
              title={`$${item.price.toFixed(2)} - ${new Date(item.timestamp).toLocaleTimeString()}`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>{new Date(firstItem.timestamp).toLocaleTimeString()}</span>
        <span className="font-medium text-blue-600">
          ${lastItem.price.toFixed(2)}
        </span>
        <span>{new Date(lastItem.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}

export const BarChart = memo(BarChartComponent);

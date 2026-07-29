import type { PriceData, PriceStats } from "../types/price";

export function computeStats(
  priceData: PriceData[],
  currentPrice: number | null,
): PriceStats | null {
  if (priceData.length === 0 || currentPrice === null) {
    return null;
  }

  const prices = priceData.map((item) => item.price);
  const initialPrice = prices[0];
  const change = ((currentPrice - initialPrice) / initialPrice) * 100;

  return {
    change,
    maxPrice: Math.max(...prices),
    minPrice: Math.min(...prices),
    averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    currentPrice,
  };
}

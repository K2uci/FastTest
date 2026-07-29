export interface PriceData {
  price: number;
  timestamp: number;
}

export interface PriceStats {
  change: number;
  maxPrice: number;
  minPrice: number;
  averagePrice: number;
  currentPrice: number;
}

export interface CoinGeckoPriceResponse {
  ethereum?: {
    usd?: number;
  };
}

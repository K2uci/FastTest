import { useMemo } from "react";
import { BarChart } from "./components/BarChart";
import { FooterInfo } from "./components/FooterInfo";
import { Header } from "./components/Header";
import { PriceDisplay } from "./components/PriceDisplay";
import { StatsCards } from "./components/StatsCards";
import { useEthereumPricePolling } from "./hooks/useEthereumPricePolling";
import { computeStats } from "./utils/stats";

function App() {
  const {
    priceData,
    currentPrice,
    lastUpdated,
    isPaused,
    error,
    loading,
    pollingInterval,
    togglePause,
    changePollingInterval,
  } = useEthereumPricePolling();

  const stats = useMemo(
    () => computeStats(priceData, currentPrice),
    [priceData, currentPrice],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Header
          pollingInterval={pollingInterval}
          isPaused={isPaused}
          loading={loading}
          currentPrice={currentPrice}
          error={error}
          lastUpdated={lastUpdated}
          onIntervalChange={changePollingInterval}
          onTogglePause={togglePause}
        />

        <PriceDisplay
          currentPrice={currentPrice}
          isPaused={isPaused}
          hasError={Boolean(error)}
        />

        <StatsCards stats={stats} />
        <BarChart data={priceData} maxItems={30} />
        <FooterInfo historyCount={priceData.length} pollingInterval={pollingInterval} />
      </div>
    </div>
  );
}

export default App;

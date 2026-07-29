import { memo } from "react";
import { API_KEY, INTERVAL_OPTIONS } from "../config/constants";

interface FooterInfoProps {
  historyCount: number;
  pollingInterval: number;
}

function FooterInfoComponent({ historyCount, pollingInterval }: FooterInfoProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <span>📊 Puntos en historial: {historyCount}</span>
        <span>🔄 Actualización cada: {pollingInterval} segundos</span>
        <span>🔑 API Key: {API_KEY ? "✅ Configurada" : "❌ No configurada"}</span>
        <span>📈 Intervalos: {INTERVAL_OPTIONS.join(", ")}s</span>
      </div>
    </div>
  );
}

export const FooterInfo = memo(FooterInfoComponent);

"use client";

import type { WeatherFactors } from "@/lib/utils/weatherFactors";
import {
  getArthritisRisk,
  getPressureChangeLabel,
  getSinusRisk,
  getWeatherScore,
} from "@/lib/utils/weatherFactors";

interface WeatherFactorsSectionProps {
  factors: WeatherFactors;
  /** When true, no outer border (used inside collapsible) */
  embedded?: boolean;
}

function RiskIcon({ risk }: { risk: "Low" | "Moderate" | "High" }) {
  if (risk === "Low") return <span className="text-green-600">✅</span>;
  if (risk === "Moderate") return <span className="text-amber-600">⚠️</span>;
  return <span className="text-red-600">🔴</span>;
}

export default function WeatherFactorsSection({ factors, embedded }: WeatherFactorsSectionProps) {
  const { score, label } = getWeatherScore(factors);
  const sinusRisk = getSinusRisk(factors);
  const arthritisRisk = getArthritisRisk(factors);
  const pressureLabel = getPressureChangeLabel(factors);

  return (
    <div
      className={`font-[family-name:var(--font-typewriter)] text-black ${embedded ? "border-t border-brand-blue-light/50 px-4 pb-4 pt-3" : "rounded-xl border-2 border-brand-blue-light bg-white p-4"}`}
    >
      {!embedded && <h3 className="mb-3 text-lg font-bold">Wellness Wonder Within</h3>}
      <div className="space-y-2 text-base">
        <p>
          <span className="font-semibold">☀️ Weather Score:</span> {score}/10 ({label})
        </p>
        <p>
          <span className="font-semibold">🤧 Sinus Risk:</span> {sinusRisk} <RiskIcon risk={sinusRisk} />
        </p>
        <p>
          <span className="font-semibold">🦴 Arthritis Risk:</span> {arthritisRisk} <RiskIcon risk={arthritisRisk} />
        </p>
        <p>
          <span className="font-semibold">💨 Pressure Change:</span> {pressureLabel}
        </p>
      </div>
    </div>
  );
}

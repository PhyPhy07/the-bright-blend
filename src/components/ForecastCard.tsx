import type { ForecastDay } from "@/lib/providers/types";
import { iconToEmoji } from "@/lib/utils/iconEmoji";

export function ForecastCard({
  day,
  provider,
}: {
  day: ForecastDay;
  provider: string;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-lg">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-amber-600">
        Optimistic Forecast
      </p>
      <p className="mb-4 flex items-center gap-2 text-amber-900">
        {day.icon && (
          <span className="text-3xl">{iconToEmoji(day.icon)}</span>
        )}
        {day.date}
      </p>
      <div className="space-y-2 text-lg">
        <p>
          <span className="font-semibold text-amber-900">High:</span>{" "}
          {day.tempHighF}°F
        </p>
        <p>
          <span className="font-semibold text-amber-900">Low:</span>{" "}
          {day.tempLowF}°F
        </p>
        <p>
          <span className="font-semibold text-amber-900">Conditions:</span>{" "}
          {day.description}
        </p>
        <p>
          <span className="font-semibold text-amber-900">Precipitation:</span>{" "}
          {day.precipitationChance}%
        </p>
      </div>
      <p className="mt-4 text-sm text-amber-600">via {provider}</p>
    </div>
  );
}

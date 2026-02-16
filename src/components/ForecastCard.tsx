import { format, parseISO } from "date-fns";
import type { ForecastDay } from "@/lib/providers/types";
import { iconToEmoji } from "@/lib/utils/renderWeatherIcon";
import { getForecastSaying } from "@/lib/utils/forecastSayings";

interface ForecastCardProps {
  day: ForecastDay;
  embedded?: boolean;
  sourceProvider?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function ForecastCard({ day, embedded, sourceProvider }: ForecastCardProps) {
  const content = (
    <>
      <p className="mb-2 text-center text-lg font-normal tracking-wide text-brand-blue font-[family-name:var(--font-typewriter)]">
        <span className="font-bold uppercase">Today&apos;s Forecast:</span> {getForecastSaying(day.icon)}
      </p>
      <p className="mb-4 text-center text-2xl text-black font-[family-name:var(--font-typewriter)]">
        {formatDate(day.date)}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3 text-xl text-black font-[family-name:var(--font-typewriter)]">
          <p>
            <span className="font-semibold">High:</span>{" "}
            {day.tempHighF}°F
          </p>
          <p>
            <span className="font-semibold">Low:</span>{" "}
            {day.tempLowF}°F
          </p>
          <p>
            <span className="font-semibold">Conditions:</span>{" "}
            {day.description}
          </p>
          <p>
            <span className="font-semibold">Precipitation:</span>{" "}
            {day.precipitationChance}%
          </p>
        </div>
        {day.icon && (
          <span className="mr-5 shrink-0 text-9xl" aria-hidden>
            {iconToEmoji(day.icon)}
          </span>
        )}
      </div>
      <p className="mt-4 text-base italic text-black font-[family-name:var(--font-typewriter)]">Like any good blend, it&apos;s all about the ratio. We mix forecasts until the vibes hit different.</p>
      {sourceProvider && (
        <p className="mt-1 text-right text-xs text-black/70 font-[family-name:var(--font-typewriter)]">Today&apos;s blend powered by {sourceProvider}</p>
      )}
    </>
  );
//renders the content of the forecast card 
  if (embedded) return content;
  return (
    <div className="rounded-xl border border-black bg-white p-6 shadow-lg">
      {content}
    </div>
  );
}

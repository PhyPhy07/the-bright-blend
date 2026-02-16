import { getForecastSaying } from "../forecastSayings";

describe("getForecastSaying", () => {
  it("returns the saying for a known icon", () => {
    expect(getForecastSaying("clear-day")).toBe("Hope with a high UV index");
    expect(getForecastSaying("rain")).toBe("Rain check on everything except ambition");
    expect(getForecastSaying("snow")).toBe("Snowy - The kind of day that justifies a third coffee");
  });

  it("returns the fallback when icon is undefined", () => {
    expect(getForecastSaying(undefined)).toBe("Warm front of unexpected good news");
  });

  it("returns the fallback for unknown icon", () => {
    // TypeScript allows WeatherIcon, but at runtime an invalid value could slip through
    expect(getForecastSaying("unknown" as any)).toBe("Warm front of unexpected good news");
  });
});

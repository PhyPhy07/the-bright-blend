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
    // Simulates invalid value at runtime (e.g. from external API)
    const invalidIcon = "unknown";
    expect(getForecastSaying(invalidIcon as Parameters<typeof getForecastSaying>[0])).toBe(
      "Warm front of unexpected good news"
    );
  });
});

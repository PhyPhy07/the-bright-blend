import { createForecastDay } from "../forecast";

describe("createForecastDay", () => {
  it("returns defaults for missing optional fields", () => {
    const result = createForecastDay({ date: "2026-02-16" });
    expect(result).toEqual({
      date: "2026-02-16",
      tempHighF: 0,
      tempLowF: 0,
      description: "",
      precipitationChance: 0,
    });
    expect(result.icon).toBeUndefined();
  });

  it("includes icon only when provided", () => {
    const withIcon = createForecastDay({ date: "2026-02-16", icon: "clear-day" });
    expect(withIcon.icon).toBe("clear-day");

    const withoutIcon = createForecastDay({ date: "2026-02-16" });
    expect(withoutIcon).not.toHaveProperty("icon");
  });

  it("preserves all provided fields", () => {
    const result = createForecastDay({
      date: "2026-02-16",
      tempHighF: 72,
      tempLowF: 55,
      description: "Partly cloudy",
      precipitationChance: 20,
      icon: "partly-cloudy-day",
    });
    expect(result).toEqual({
      date: "2026-02-16",
      tempHighF: 72,
      tempLowF: 55,
      description: "Partly cloudy",
      precipitationChance: 20,
      icon: "partly-cloudy-day",
    });
  });

  it("uses 0 for undefined numeric fields", () => {
    const result = createForecastDay({
      date: "2026-02-16",
      tempHighF: 70,
      // tempLowF, precipitationChance omitted
    });
    expect(result.tempLowF).toBe(0);
    expect(result.precipitationChance).toBe(0);
  });
});

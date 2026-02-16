import { wmoCodeToDisplay, toWeatherIcon } from "../wmoCodes";

describe("wmoCodeToDisplay", () => {
  it("returns description and icon for known WMO codes", () => {
    expect(wmoCodeToDisplay(0)).toEqual({ description: "Clear sky", icon: "clear-day" });
    expect(wmoCodeToDisplay(3)).toEqual({ description: "Overcast", icon: "cloudy" });
    expect(wmoCodeToDisplay(61)).toEqual({ description: "Slight rain", icon: "rain" });
    expect(wmoCodeToDisplay(95)).toEqual({ description: "Thunderstorm", icon: "thunder-rain" });
  });

  it("returns unknown fallback for unknown codes", () => {
    expect(wmoCodeToDisplay(999)).toEqual({ description: "Unknown", icon: "cloudy" });
    expect(wmoCodeToDisplay(-1)).toEqual({ description: "Unknown", icon: "cloudy" });
  });
});

describe("toWeatherIcon", () => {
  it("returns the icon for valid values", () => {
    expect(toWeatherIcon("clear-day")).toBe("clear-day");
    expect(toWeatherIcon("rain")).toBe("rain");
    expect(toWeatherIcon("partly-cloudy-night")).toBe("partly-cloudy-night");
  });

  it("normalizes thunderstorm to thunder-rain", () => {
    expect(toWeatherIcon("thunderstorm")).toBe("thunder-rain");
  });

  it("returns cloudy for unknown values", () => {
    expect(toWeatherIcon("unknown")).toBe("cloudy");
    expect(toWeatherIcon("invalid")).toBe("cloudy");
  });

  it("returns cloudy for undefined", () => {
    expect(toWeatherIcon(undefined)).toBe("cloudy");
  });
});

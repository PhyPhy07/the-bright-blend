const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "WeatherWonder/1.0";

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  /** City and state only, e.g. "Los Angeles, California" */
  cityState: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

function formatCityState(address: NominatimAddress): string {
  const city = address.city ?? address.town ?? address.village ?? address.municipality ?? "";
  const state = address.state ?? "";
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  if (address.postcode && address.country) return `ZIP ${address.postcode}, ${address.country}`;
  return address.country ?? "";
}

/** US zip: 5 digits or 5+4 (12345 or 12345-6789) */
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;

function normalizeQuery(query: string): string {
  const trimmed = query.trim();
  if (US_ZIP_REGEX.test(trimmed)) {
    return `${trimmed}, USA`;
  }
  return trimmed;
}

export async function geocode(query: string): Promise<GeocodeResult | null> {
  const normalized = normalizeQuery(query);
  if (!normalized) return null;

  const params = new URLSearchParams({
    q: normalized,
    format: "json",
    limit: "1",
    addressdetails: "1",
  });

  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: NominatimAddress;
  }>;
  const first = data[0];
  if (!first) return null;

  const address = first.address ?? {};
  const cityState = formatCityState(address) || first.display_name;

  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
    displayName: first.display_name,
    cityState,
  };
}

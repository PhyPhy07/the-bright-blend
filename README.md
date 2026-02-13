# The Bright Blend

**The Bright Blend** — An app that finds the silver lining by displaying the most optimistic (sunniest/warmest) forecast for NYC, regardless of reality.

## Live App

**Vercel Deployment:** [https://the-bright-blend.vercel.app/](https://the-bright-blend.vercel.app/)

---

## How It Works

### Flow

```
User visits the app (or clicks Rebrew)
    → Server fetches from Open-Meteo, Pirate Weather, and Morning Brew
    → Normalizes dates and filters to today's forecast for NYC
    → Drops outliers (forecasts >15°F from median)
    → Scores each: temp + sunny bonus − precip penalty
    → Picks the highest-scoring forecast
    → Displays the optimistic result
```

### Optimistic Scoring

The app selects the "best" forecast using:

- **Temperature** — Higher is better
- **Sunny bonus** — +10 for clear or partly cloudy conditions
- **Precipitation penalty** — Lower rain chance is better

Outlier filtering ensures one bad provider can't cause drastic swings (e.g. 60° → 38°).

### Providers

| Provider | API | Key Required |
|----------|-----|--------------|
| Open-Meteo | [open-meteo.com](https://open-meteo.com) | No |
| Pirate Weather | [pirateweather.net](https://pirateweather.net) | Yes |
| Morning Brew | [weather-ashy-gamma-36.vercel.app](https://weather-ashy-gamma-36.vercel.app/api/forecast) | No |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Pirate Weather](https://pirateweather.net) API key (free)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/PhyPhy07/the-bright-blend.git
cd the-bright-blend
npm install
```

2. Create `.env.local` and add your Pirate Weather API key:

```
PIRATE_WEATHER_API_KEY=your_key_here
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## Architecture

- **Provider registry** — Single source of truth for weather providers; add new providers by implementing the `WeatherProvider` interface and registering in `getProviders()`
- **Normalized types** — `NormalizedForecast` and `ForecastDay` ensure consistency across providers
- **Optimizer** — Pluggable scoring logic for selecting the "best" forecast

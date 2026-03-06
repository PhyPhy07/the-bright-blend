# Weather Wonder — Data Flow & Architecture

## Full System Diagram

```mermaid
flowchart TB
    subgraph User["👤 User"]
        Visit[Visit Page]
        Search[Search Location]
        Remix[Click Remix]
        Expand[Expand Weather Factors]
    end

    subgraph Server["🖥️ Server (Next.js)"]
        subgraph Page["page.tsx"]
            GetCached[getCachedForecast]
        end
        
        subgraph API["API Routes"]
            GeocodeAPI["/api/geocode?q="]
            ForecastAPI["/api/forecast?lat=&lon="]
        end
        
        subgraph Fetch["fetchForecast.ts"]
            FetchOpt[fetchOptimisticForecast]
            Cache[(unstable_cache<br/>5 min TTL)]
        end
        
        subgraph Providers["Weather Providers"]
            OM[Open-Meteo]
            PW[Pirate Weather]
            WG[Weather.gov]
        end
        
        subgraph Factors["weatherFactors.ts"]
            FetchFactors[fetchWeatherFactors]
        end
        
        subgraph Optimizer["optimizer.ts"]
            Filter[Filter to Today]
            Outliers[Drop Outliers ±7°F]
            Score[Score Each]
            Pick[Pick Highest]
        end
    end

    subgraph External["🌐 External APIs"]
        Nominatim[Nominatim<br/>Geocoding]
        OM_API[Open-Meteo API]
        PW_API[Pirate Weather API]
        WG_API[Weather.gov API]
    end

    subgraph Client["📱 Client (React)"]
        FS[ForecastSection]
        LS[LocationSearch]
        FWR[ForecastWithRefresh]
        FC[ForecastCard]
        WFS[WeatherFactorsSection]
    end

    %% Initial Load
    Visit --> GetCached
    GetCached --> Cache
    Cache -->|miss| FetchOpt
    FetchOpt --> OM
    FetchOpt --> PW
    FetchOpt --> WG
    FetchOpt --> FetchFactors
    OM --> OM_API
    PW --> PW_API
    WG --> WG_API
    FetchFactors --> OM_API
    OM --> Filter
    PW --> Filter
    WG --> Filter
    Filter --> Outliers --> Score --> Pick
    Pick --> FS
    FetchFactors --> FS

    %% Search Flow
    Search --> LS
    LS --> GeocodeAPI
    GeocodeAPI --> Nominatim
    GeocodeAPI -->|lat, lon, cityState| FS
    FS --> ForecastAPI
    ForecastAPI --> Cache
    Cache --> FS

    %% Remix Flow
    Remix --> FWR
    FWR --> FS
    FS --> ForecastAPI

    %% UI
    FS --> LS
    FS --> FWR
    FWR --> FC
    FWR --> WFS
    Expand --> WFS
```

## Architecture Layers

```mermaid
flowchart LR
    subgraph Presentation["Presentation Layer"]
        Page[page.tsx]
        API[API Routes]
    end

    subgraph Application["Application Layer"]
        Fetch[fetchForecast]
        Optimizer[optimizer]
        Geocode[geocode]
        Factors[weatherFactors]
    end

    subgraph Domain["Domain Layer"]
        Types[types.ts]
        Registry[provider registry]
    end

    subgraph Infrastructure["Infrastructure Layer"]
        OM[Open-Meteo]
        PW[Pirate Weather]
        WG[Weather.gov]
        Nominatim[Nominatim]
    end

    Page --> Fetch
    API --> Fetch
    API --> Geocode
    Fetch --> Registry
    Fetch --> Optimizer
    Fetch --> Factors
    Registry --> OM
    Registry --> PW
    Registry --> WG
    Factors --> OM
    Geocode --> Nominatim
    Fetch --> Types
```

## Data Flow Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant P as page.tsx
    participant C as getCachedForecast
    participant F as fetchOptimisticForecast
    participant OM as Open-Meteo
    participant PW as Pirate Weather
    participant WG as Weather.gov
    participant WF as fetchWeatherFactors
    participant O as getOptimisticForecast
    participant FS as ForecastSection
    participant UI as ForecastCard + WeatherFactorsSection

    U->>P: Visit / (or Remix)
    P->>C: getCachedForecast(lat, lon)
    C->>C: Check cache key [forecast, lat, lon]
    
    alt Cache miss
        C->>F: fetchOptimisticForecast(lat, lon)
        par Parallel fetch
            F->>OM: fetchForecast(lat, lon)
            F->>PW: fetchForecast(lat, lon)
            F->>WG: fetchForecast(lat, lon)
            F->>WF: fetchWeatherFactors(lat, lon)
        end
        OM-->>F: NormalizedForecast
        PW-->>F: NormalizedForecast
        WG-->>F: NormalizedForecast
        WF-->>F: WeatherFactors
        F->>O: getOptimisticForecast(forecasts)
        O->>O: filter today → drop outliers → score → pick best
        O-->>F: OptimisticForecast
        F-->>C: { optimistic, providers, weatherFactors }
    end
    
    C-->>P: { optimistic, weatherFactors }
    P-->>FS: initialData, initialWeatherFactors
    FS-->>UI: forecast, weatherFactors
    UI-->>U: Render
```

## Location Search Flow

```mermaid
sequenceDiagram
    participant U as User
    participant LS as LocationSearch
    participant FS as ForecastSection
    participant G as /api/geocode
    participant N as Nominatim
    participant F as /api/forecast

    U->>LS: Type "Phoenix" + Search
    LS->>FS: onSearch("Phoenix")
    FS->>G: GET /api/geocode?q=Phoenix
    G->>N: geocode("Phoenix")
    N-->>G: { lat, lon, cityState }
    G-->>FS: { lat: 33.45, lon: -112.07, cityState: "Phoenix, Arizona" }
    FS->>FS: setCoords, setLocationName
    FS->>F: GET /api/forecast?lat=33.45&lon=-112.07
    F-->>FS: { optimistic, weatherFactors }
    FS->>FS: setForecast, setWeatherFactors
    FS-->>U: Re-render with new location
```

## Optimizer Logic

```mermaid
flowchart TD
    A[3 Provider Forecasts] --> B[Extract Today from Each]
    B --> C[Compute Median Temp]
    C --> D[Drop Outliers<br/>±7°F from median]
    D --> E[Score Each Candidate]
    E --> F{Score = tempHighF<br/>+ sunnyBonus 10<br/>- precip × 0.5}
    F --> G[Pick Highest Score]
    G --> H[Return Best Day + sourceProvider]
```

## Component Hierarchy

```mermaid
flowchart TD
    Page[page.tsx]
    Page --> Header[Header]
    Page --> FS[ForecastSection]
    
    FS --> LS[LocationSearch]
    FS --> Error[ErrorAlert]
    FS --> FWR[ForecastWithRefresh]
    
    LS --> Input[input]
    LS --> SearchBtn[Search button]
    
    FWR --> Card[Forecast Card container]
    FWR --> FactorsToggle[Weather Factors toggle]
    FWR --> RemixBtn[Remix button]
    
    Card --> FC[ForecastCard]
    Card --> Img[weatherwonder / mobileview]
    
    FactorsToggle --> WFS[WeatherFactorsSection]
    
    FC --> Temp[High/Low]
    FC --> Cond[Conditions]
    FC --> Precip[Precipitation]
    FC --> Saying[Forecast saying]
    
    WFS --> Score[Weather Score]
    WFS --> Sinus[🤧 Sinus Risk]
    WFS --> Arthritis[🦴 Arthritis Risk]
    WFS --> Pressure[💨 Pressure Change]
```

## File Map

| File | Role |
|------|------|
| `src/app/page.tsx` | Server entry; fetches initial forecast (NYC), passes to ForecastSection |
| `src/app/api/forecast/route.ts` | GET handler; parses lat/lon, returns cached forecast + factors |
| `src/app/api/geocode/route.ts` | GET handler; geocodes query to lat, lon, cityState |
| `src/lib/fetchForecast.ts` | Orchestrates providers + weather factors; wraps in unstable_cache |
| `src/lib/optimizer.ts` | Filters to today, drops outliers, scores, picks best forecast |
| `src/lib/utils/weatherFactors.ts` | Fetches pressure/humidity/wind from Open-Meteo; computes risks |
| `src/lib/utils/geocode.ts` | Calls Nominatim; returns lat, lon, cityState |
| `src/lib/providers/registry.ts` | Returns [Open-Meteo, Pirate Weather, Weather.gov] |
| `src/lib/providers/openMeteo.ts` | Fetches from Open-Meteo, normalizes to ForecastDay |
| `src/lib/providers/pirateWeather.ts` | Fetches from Pirate Weather, normalizes |
| `src/lib/providers/weatherGov.ts` | Fetches from Weather.gov (points → forecast), normalizes |
| `src/components/ForecastSection.tsx` | Client; owns forecast/coords state; search + refresh handlers |
| `src/components/ForecastWithRefresh.tsx` | Renders ForecastCard, WeatherFactors toggle, Remix button |
| `src/components/ForecastCard.tsx` | Displays today's forecast (temp, conditions, saying) |
| `src/components/WeatherFactorsSection.tsx` | Displays score, sinus/arthritis risk, pressure change |
| `src/components/LocationSearch.tsx` | Search input + button; calls onSearch |

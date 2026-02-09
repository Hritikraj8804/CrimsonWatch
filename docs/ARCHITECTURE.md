# Architecture Documentation

## System Overview

CrimsonWatch sits on top of the local Archestra environment. It does not interfere with the agents but "watches" them via the telemetry they emit.

```mermaid
graph TD
    subgraph "Archestra Environment"
        Agents[AI Agents] -->|Emit Telemetry| Otel[OpenTelemetry Collector]
        Otel -->|Expose Metrics| Prom[Prometheus :9090]
    end

    subgraph "CrimsonWatch Core (User Machine)"
        Poller[Metric Poller] -->|Query every 5s| Prom
        Poller -->|Raw Events| Engine[Correlation Engine]
        
        Engine -->|Detect Patterns| Risk[Risk Scorer]
        Engine -->|Group Events| Timeline[Incident Timeline]
        
        API[Flask REST API :5000] <-- Serve Data --> Engine
    end

    subgraph "CrimsonWatch UI (Browser)"
        Dash[React Dashboard :3000] -->|Fetch JSON| API
        User[Security Analyst] --> Dash
    end
```

## Data Flow
1.  **Ingestion**: Python script periodically hits `http://localhost:9090/api/v1/query`.
2.  **Normalization**: Raw Prometheus JSON is converted to internal `Event` objects.
3.  **Analysis**:
    -   Events are passed through a `RuleSet`.
    -   If a rule triggers, an `Incident` is created/updated.
    -   Global `ThreatLevel` is recalculated.
4.  **Presentation**: Frontend polls `/api/incidents` and `/api/metrics` to render the view.

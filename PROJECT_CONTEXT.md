# PROJECT_CONTEXT.md - CrimsonWatch Master Logic

## 1. Project Overview
- **Name**: CrimsonWatch
- **Team**: Team Red (Solo)
- **Tagline**: The Security Sentinel Dashboard for Archestra
- **Goal**: Transform raw Archestra logs into actionable threat intelligence with a "SOC" (Security Operations Center) feel.
- **Key Differentiator**: We don't just show stats; we show *stories* (attack narratives) and *risk scores*.

## 2. Architecture (3-Tier)
1.  **Data Layer (Local)**:
    -   Source: Archestra metrics via Prometheus (`localhost:9090`).
    -   Real-time: Redis streams (optional) or polling.
2.  **Intelligence Layer (Python/Flask)**:
    -   Ingests raw metrics.
    -   Applies `RULES` to detect patterns (e.g., "5 blocked calls in 1 min = Brute Force").
    -   Calculates a `RiskScore` (0-100).
3.  **Presentation Layer (React + Tailwind)**:
    -   Theme: "Team Red" (Dark mode, red accents, hacker/cybersecurity aesthetic).
    -   Visuals: Gauge, Timeline, Leaderboard, Ticker.

## 3. Core Features & Logic
### A. Threat Level Gauge
-   **Logic**: `NormalizedScore = (BlockedCalls * 2) + (HighRiskToolUses * 5) + (PermViolations * 10)`
-   **Visual**: Radial gauge. Green (<30), Yellow (30-70), Red (>70).

### B. Attack Timeline
-   **Logic**: Group events by `agent_id` within a time window (e.g., 5 mins).
-   **Display**: "Incident Cards" with severity, time, and suggested action.

### C. Live Alert Feed
-   **Logic**: Push notifications for immediate high-severity events.
-   **Sound**: Subtle "beep" for Red alerts (optional).

## 4. Tech Stack Constraints
-   **Backend**: Python 3.9+, Flask, `requests`, `prometheus-client`.
-   **Frontend**: React (Vite or CRA), Tailwind CSS, Recharts.
-   **Port Mappings**:
    -   Prometheus: `9090` (External Source)
    -   CrimsonWatch Backend: `5000`
    -   CrimsonWatch Frontend: `3000`

## 5. Deployment
-   Frontend: GitHub Pages (must support relative paths or hash router).
-   Backend: Local execution (since Archestra is local).

## 6. AI Agent Rules (For Future LLMs)
1.  **Do NOT** invent new tiers. Stick to the 3-tier model.
2.  **Do NOT** overcomplicate the database. Use in-memory or simple JSON/SQLite for a hackathon.
3.  **ALWAYS** prioritize aesthetics. It must look "premium" and "cybersecurity".
4.  **ALWAYS** check `API_SPEC.md` before changing endpoints.

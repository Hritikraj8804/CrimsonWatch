# CrimsonWatch - Security Sentinel Dashboard

A professional-grade security operations center (SOC) dashboard for monitoring Archestra AI agents. Built for hackathons, designed for production.

## Features

**Real-time Threat Detection**
- Intelligent rule-based threat detection
- Risk scoring algorithm (0-100 scale)
- Automated incident correlation
- Live alert feed with severity classification

**Cyberpunk UI/UX**
- Dark theme with crimson accents
- Glass morphism design
- Animated threat gauge
- Real-time data visualization
- Responsive layout

**Core Components**
- **Threat Level Gauge**: Visual representation of system risk
- **Attack Timeline**: Chronological incident display with severity
- **Agent Leaderboard**: Risk-ranked agent monitoring
- **Live Alert Feed**: Real-time security notifications
- **Stats Dashboard**: Key security metrics

## Tech Stack

**Backend**
- Python 3.9+
- Flask with CORS
- Prometheus integration
- Background polling engine
- In-memory data store

**Frontend**
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS
- Framer Motion animations
- Recharts visualization
- Lucide icons

## Quick Start

### 1. Start the Backend

```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```

Backend will run on `http://localhost:5000`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. Build for Production

```bash
cd frontend
npm run build
```

Production build will be in `frontend/dist/`

## API Endpoints

- `GET /api/metrics` - Global dashboard metrics
- `GET /api/incidents` - Security incidents list
- `GET /api/agents` - Agent leaderboard
- `GET /api/events` - Raw events (debug)
- `GET /api/threat-summary` - Complete threat summary
- `GET /health` - Health check

## Configuration

Environment variables:
- `PROMETHEUS_URL` - Prometheus endpoint (default: http://localhost:9090)
- `POLL_INTERVAL` - Metrics polling interval in seconds (default: 5)
- `PORT` - Backend port (default: 5000)

## Threat Detection Rules

1. **Brute Force Attack**: 5+ blocked calls in short timeframe
2. **Permission Violation**: Unauthorized access attempts
3. **High-Risk Tool Usage**: File delete, system exec, network send
4. **Suspicious Data Access**: High-sensitivity data access
5. **Anomalous Behavior**: ML-based anomaly detection

## Project Structure

```
├── backend/
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── types.ts        # TypeScript types
│   │   ├── App.tsx         # Main app
│   │   └── index.css       # Styles
│   ├── package.json
│   └── vite.config.ts
└── docs/
    ├── ARCHITECTURE.md
    └── API_SPEC.md
```

## License

MIT License - Built with passion for security monitoring.

---

**Ready to win your hackathon!** CrimsonWatch combines stunning visuals with robust security monitoring capabilities.

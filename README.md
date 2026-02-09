# CrimsonWatch - Security Sentinel Dashboard

**Team Red** | **Event**: 2 Fast 2 MCP Hackathon  
**Live Demo**: [GitHub Pages Link]

A professional-grade security operations center (SOC) dashboard for monitoring Archestra AI agents.

## 🛡️ Concept
CrimsonWatch transforms raw security logs from Archestra agents into **actionable threat intelligence**. Instead of staring at terminal output, security analysts get a real-time, visual command center.

**Note**: This is a **Frontend-Only Demo Version** built for the hackathon. It uses static mock data to simulate how the dashboard would behave when connected to a real Archestra instance via Prometheus.

## 🚀 Key Features

- **Real-time Threat Gauge**: Visualizes aggregate system risk (0-100).
- **Attack Simulation**: Toggle between "Normal" and "Attack" modes to see the dashboard respond to threats.
- **Incident Timeline**: Correlated security events with severity classification.
- **Risky Agent Leaderboard**: Identifies which agents are generating the most blocked calls.
- **Live Alert Feed**: Ticker-style updates for immediate awareness.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Custom "Team Red" Cyberpunk Theme)
- **Visuals**: Recharts, Framer Motion, Lucide Icons
- **Deployment**: GitHub Pages

## 📦 Installation

This project is pure static frontend. You don't need a backend server.

1. **Clone the repo**
   ```bash
   git clone https://github.com/Hritikraj8804/CrimsonWatch.git
   cd CrimsonWatch/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## 🎮 How to Demo

1. **Start the app**: You'll see the "Normal Operation" state (Green gauge, low activity).
2. **Simulate Attack**: Click the **"SIMULATE ATTACK"** button in the top right.
3. **Observe**:
   - Threat Gauge spikes to Red (Critical).
   - New "High Severity" incidents appear in the timeline.
   - The Alert Ticker starts showing intrusion warnings.
   - The "Risky Agents" leaderboard updates.

## 📁 Project Structure

```
frontend/
├── public/
│   └── mock-data/       # JSON files for simulation
├── src/
│   ├── components/      # React UI components
│   ├── hooks/           # Data fetching logic
│   └── ...
```

## 📄 License
MIT License

# CrimsonWatch - AI Agent Security Monitoring Platform

**Team Red** | **2 Fast 2 MCP Hackathon**

## 🛡️ What is CrimsonWatch?

CrimsonWatch is the first **Security Operations Center (SOC) dashboard** specifically designed for monitoring AI agents. It uses Archestra's observability features to detect and prevent prompt injection attacks, data exfiltration, and unauthorized tool usage in real-time.

## 🎯 The Problem

AI agents can be hijacked through prompt injection attacks:
- **ChatGPT** (Apr 2023) - Data stolen via markdown injection
- **GitHub Copilot** (Jun 2024) - Prompt injection vulnerability
- **Slack AI** (Aug 2024) - Data exfiltration attack

Traditional security tools scan code for bugs. **CrimsonWatch monitors what AI agents are actually doing.**

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CrimsonWatch Stack                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │  CrimsonWatch   │    │   Archestra     │                 │
│  │  MCP Server     │◄───│   Platform      │                 │
│  │  (Python)       │    │   (Docker)      │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
│           │                      │                          │
│           │   Prometheus Metrics │                          │
│           │   OpenTelemetry      │                          │
│           ▼                      ▼                          │
│  ┌─────────────────────────────────────────┐                │
│  │       CrimsonWatch Dashboard            │                │
│  │       (React + Vite)                    │                │
│  │       - Threat Level Gauge              │                │
│  │       - Agent Activity Timeline         │                │
│  │       - Security Alerts                 │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Python 3.9+
- Node.js 18+

### 1. Start Archestra Platform

```bash
docker pull archestra/platform:latest
docker run -p 9000:9000 -p 3000:3000 -p 9090:9090 \
  -e ARCHESTRA_QUICKSTART=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v archestra-postgres-data:/var/lib/postgresql/data \
  -v archestra-app-data:/app/data \
  archestra/platform
```

### 2. Install CrimsonWatch MCP Server

```bash
cd mcp-server
pip install -r requirements.txt
python server.py
```

### 3. Register in Archestra
1. Go to `http://localhost:3000`
2. Navigate to MCP Registry → Add New → Custom
3. Add CrimsonWatch server URL: `http://host.docker.internal:8000`

### 4. Start the Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## 📊 Features

### Real-Time Threat Monitoring
- **Threat Level Gauge**: Aggregate risk score (0-100)
- **Live Agent Activity**: See what agents are doing right now
- **Security Alerts**: Instant notifications for suspicious behavior

### Security Intelligence
- **Blocked Tool Calls**: Track when Archestra's guardrails prevent dangerous actions
- **Prompt Injection Detection**: Identify potential attack patterns
- **Data Exfiltration Prevention**: Monitor for unauthorized data access

### Agent Risk Profiling
- **Risk Scores**: Per-agent security ratings
- **Behavioral Analysis**: Detect anomalies in agent behavior
- **Audit Trail**: Complete history of agent actions

## 🔧 CrimsonWatch MCP Tools

| Tool | Description |
|------|-------------|
| `get_threat_level` | Returns current system threat level |
| `get_active_alerts` | Lists all active security alerts |
| `get_agent_risk_profile` | Returns risk assessment for specific agent |
| `scan_for_injection` | Analyzes text for prompt injection patterns |
| `log_security_event` | Records a security event for monitoring |

## 📁 Project Structure

```
crimsonwatch/
├── mcp-server/          # Python MCP server
│   ├── server.py        # Main MCP server
│   ├── security/        # Security analysis logic
│   └── requirements.txt
├── frontend/            # React dashboard
│   ├── src/
│   └── package.json
├── docker-compose.yml   # Full stack deployment
└── README.md
```

## 🏆 Hackathon Submission

**Track**: Best Use of Archestra

**Key Differentiators**:
1. First SOC dashboard specifically for AI agent monitoring
2. Deep integration with Archestra's security features
3. Real-time visualization of agent behavior
4. Production-ready architecture

## 📄 License

MIT License

---

**Built with ❤️ by Team Red for 2 Fast 2 MCP Hackathon**

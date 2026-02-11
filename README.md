# CrimsonWatch - AI Agent Security Operations Center

<div align="center">
  <h3>🛡️ Real-Time Security Monitoring for AI Agents on Archestra 🛡️</h3>
  
  [![Archestra Hackathon](https://img.shields.io/badge/Hackathon-2_Fast_2_MCP-crimson)](https://archestra.ai)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 🚨 The Problem
AI agents running on Archestra have no security monitoring. Traditional security tools scan code, but they don't see what agents *do* in real-time.

## 🦅 The Solution
CrimsonWatch provides a security layer for Archestra through:
- **MCP Security Tools** - Agents can call security functions
- **Real-Time Monitoring** - Dashboard shows agent activity
- **Threat Detection** - Identifies prompt injection and suspicious behavior

## 🏗️ Architecture

```
Archestra Platform (localhost:3000)
    ↓ API Integration
CrimsonWatch MCP Server (localhost:8002)
    ↓ Security Data
Dashboard (localhost:5173)
```

## 🚀 Quick Start

### 1. Start Services
```bash
# Start Archestra & Prometheus
docker-compose up -d

# Start MCP Server
start_mcp.bat

# Start Dashboard
cd frontend
npm install
npm run dev
```

### 2. Access
- **Dashboard**: http://localhost:5173
- **Archestra**: http://localhost:3000
- **MCP Server**: http://localhost:8002
- **Prometheus**: http://localhost:9090

### 3. Demo
```bash
cd mcp-server
python test_agent.py
```

## 🔧 MCP Security Tools

CrimsonWatch provides 3 security tools for Archestra agents:

| Tool | Description |
|------|-------------|
| `get_threat_level` | Returns current system threat level (0-100) |
| `scan_for_injection` | Scans text for prompt injection patterns |
| `log_security_event` | Logs security events for monitoring |

## 📊 Archestra Integration

### MCP Protocol Implementation
```python
# Uses official MCP SDK
from mcp.server import Server
from mcp.server.stdio import stdio_server

@server.list_tools()
async def list_tools():
    return [Tool(...)]  # Security tools
```

### API Integration
```python
# Connects to Archestra Gateway
resp = await client.get(
    f"{archestra_url}/v1/agents",
    headers={"Authorization": f"Bearer {api_key}"}
)
```

### Configuration
```json
{
  "mcpServers": {
    "crimsonwatch": {
      "command": "python",
      "args": ["server.py"]
    }
  }
}
```

## 🎯 Key Features

- ✅ Real MCP protocol implementation
- ✅ Archestra API integration
- ✅ Prometheus metrics export
- ✅ Real-time threat detection
- ✅ Professional React dashboard
- ✅ Production-ready architecture

## 📁 Project Structure

```
archestra-hack/
├── mcp-server/          # MCP server with security tools
│   ├── server.py        # Main MCP server
│   ├── test_agent.py    # Test agent demonstrating tools
│   └── security/        # Security analysis modules
├── frontend/            # React dashboard
│   └── src/            # Dashboard components
├── docker-compose.yml   # Archestra + Prometheus
├── mcp.json            # MCP server configuration
└── README.md           # This file
```

## 🏆 Why CrimsonWatch

1. **First SOC for AI Agents** - No existing solution
2. **Archestra Integration** - Uses MCP protocol + API
3. **Production Ready** - Complete architecture
4. **Extensible** - Easy to add more security tools

## 📝 Configuration

Update `.env` with your Archestra API key:
```bash
ARCHESTRA_API_KEY=your_key_here
VITE_ARCHESTRA_URL=http://localhost:9000
```

## 🎬 Demo Script

1. Show Archestra platform running
2. Open CrimsonWatch dashboard
3. Run `python test_agent.py`
4. Watch real-time security monitoring
5. Show threat detection in action

---

**Built for Archestra Hackathon 2026** | Team: 2 Fast 2 MCP

# CrimsonWatch - AI Agent Security Operations Center (SOC)

<div align="center">
  <h3>🛡️ Secure Your AI Agents in Real-Time 🛡️</h3>
  <p>The first dedicated SOC for monitoring, detecting, and preventing attacks on AI agents running on Archestra.</p>
  
  [![Archestra Hackathon](https://img.shields.io/badge/Hackathon-2_Fast_2_MCP-crimson)](https://archestra.ai)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/Frontend-React_18-blue)](https://reactjs.org/)
  [![MCP](https://img.shields.io/badge/Backend-MCP-green)](https://modelcontextprotocol.io)
</div>

---

## 🚨 The Threat Landscape
AI agents are the new attack vector. Traditional security tools scan code, but they don't see what agents *do*.
- **Prompt Injection**: Hijacking agent instructions to bypass guardrails.
- **Data Exfiltration**: Agents reading sensitive files and sending them to external servers.
- **Tool Abuse**: Unauthorized execution of dangerous commands or API calls.

## 🦅 What is CrimsonWatch?
CrimsonWatch gives you **eyes on your agents**. It integrates directly with Archestra's observability layer via the **Model Context Protocol (MCP)** to provide:

1.  **Real-Time Threat Dashboard**: Visualize threat levels, active attacks, and blocked attempts.
2.  **Agent Risk Profiling**: Score agents based on their behavior and tool usage patterns.
3.  **Live Security Alerts**: Instant notification when an agent goes rogue.
4.  **Forensic Timeline**: A complete playback of every security event.

## 🏗️ Technical Architecture

CrimsonWatch is a full-stack application leveraging the power of MCP:

```text
+---------------------+       +----------------------+
|  Archestra Platform |       |     CrimsonWatch     |
| (Docker Container)  |       |   (Local Machine)    |
|                     |       |                      |
|  [ AI Agents ]      |       |  [ MCP Server (Py) ] |
|        |            | <---> |          ^           |
|        v            |  MCP  |          |           |
| [ MCP Gateway ]     |       |          | Control   |
|        |            |       |          v           |
|        v            | HTTP  |  [ React Dashboard ] |
| [ Prometheus Metrics] ----> |          ^           |
+---------------------+       |          |           |
                              +----------|-----------+
                                         |
                                    [ User ]
```

### 1. Python MCP Server (`/mcp-server`)
A custom MCP server that acts as the security brain. It:
- **Analyzes** tool calls for dangerous patterns (e.g., `rm -rf`, SQL injection).
- **Calculates** real-time risk scores for every agent.
- **Exposes** security tools (`scan_for_injection`, `get_threat_level`) back to Archestra.

### 2. Monitoring Dashboard (`/frontend`)
A modern, dark-mode React application built with Vite and Tailwind CSS.
- **Live Connection**: Connects to Archestra's Prometheus metrics.
- **Interactive Graphs**: Visualizes complex threat data associated with agents.
- **Control Center**: Allows admins to simulate attacks and view live alerts.

### 3. Service Map
| Service | URL | Description |
|---------|-----|-------------|
| **CrimsonWatch Dashboard** | [http://localhost:5173](http://localhost:5173) | **Main Interface**. Security visualizations & alerts. |
| **Archestra Platform** | [http://localhost:3000](http://localhost:3000) | Manage Agents and Gateways. |
| **Prometheus** | [http://localhost:9090](http://localhost:9090) | Raw metrics database. |
| **MCP Server Health** | [http://localhost:8000/metrics](http://localhost:8000/metrics) | Python server status & metrics. |
| **MCP Gateway** | `localhost:9000` | API Endpoint (Do not visit in browser). |

## 🚀 Quick Start Guide

### Prerequisites
- **Docker Desktop** installed and running
- **Node.js 18+**
- **Python 3.10+**

### Step 1: Start Archestra
Run the Archestra platform along with Prometheus for metrics.

```bash
docker-compose up -d archestra
```

### Step 2: Launch the MCP Server
This server handles the security logic and interacts with Archestra.

```bash
cd mcp-server
pip install -r requirements.txt
python server.py
```
*The server will run on port 8000.*

### Step 3: Launch the Dashboard
Start the UI to visualize your agent security status.

```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

## 🎮 How to Use

1.  **Connect**: The dashboard automatically connects to your local Archestra instance.
2.  **Monitor**: Watch the **Threat Level Gauge** and **Active Agents** list.
3.  **Simulate**: Use the **"Simulate Attack"** button (if in Demo Mode) to see how CrimsonWatch reacts to security incidents.
4.  **Investigate**: Click on any agent in the **Aggents** tab to see their full risk profile and tool usage history.

## 🔧 MCP Tools Provided

CrimsonWatch exposes these tools to your AI agents to help them protect themselves:

| Tool Name | Description |
|-----------|-------------|
| `get_threat_level` | Returns the current system-wide DEFCON level (0-100). |
| `scan_for_injection` | Scans a user's prompt for known jailbreak patterns. |
| `log_security_event` | Allows an agent to report suspicious activity to the SOC. |
| `get_agent_risk_profile` | Retrieves the calculated risk score for a specific agent ID. |

## 🏆 Hackathon Details
**Team**: Team Red
**Track**: Best Use of Archestra
**Tech Stack**: Python (MCP SDK), React, TypeScript, Tailwind CSS, Docker, Prometheus.

---
*Protect your agents before they compromise your data.*

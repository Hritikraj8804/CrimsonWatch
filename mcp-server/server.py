#!/usr/bin/env python3
import asyncio
import json
import os
from datetime import datetime
from aiohttp import web, ClientSession
from prometheus_client import start_http_server, Gauge, Counter
from dotenv import load_dotenv

load_dotenv()

ARCHESTRA_URL = os.getenv("VITE_ARCHESTRA_URL", "http://localhost:9000")
API_KEY = os.getenv("ARCHESTRA_API_KEY", "")

# Prometheus Metrics
THREAT_LEVEL = Gauge('threat_level', 'Current threat level')
BLOCKED_CALLS = Counter('blocked_calls_total', 'Blocked calls')
AGENT_RISK = Gauge('agent_risk_score', 'Agent risk', ['agent_id'])

# Security Store
class Store:
    def __init__(self):
        self.threat_level = 25
        self.blocked_calls = 0
        self.alerts = []
        self.agents = {}
        self.events = []
        THREAT_LEVEL.set(25)

store = Store()

# MCP Tools as HTTP endpoints
async def handle_get_threat_level(request):
    result = {
        "threat_level": store.threat_level,
        "status": "CRITICAL" if store.threat_level >= 70 else "ELEVATED" if store.threat_level >= 40 else "NORMAL",
        "blocked_calls": store.blocked_calls,
        "timestamp": datetime.now().isoformat()
    }
    return web.json_response(result)

async def handle_scan_injection(request):
    data = await request.json()
    text = data.get("text", "").lower()
    patterns = ["ignore previous", "forget everything", "you are now"]
    detected = [p for p in patterns if p in text]
    risk = len(detected) * 30
    
    if detected:
        store.threat_level = min(100, store.threat_level + 15)
        THREAT_LEVEL.set(store.threat_level)
        store.alerts.insert(0, {
            "id": f"alert-{len(store.alerts)}",
            "severity": "HIGH",
            "message": f"Injection detected: {detected}",
            "timestamp": datetime.now().isoformat()
        })
    
    result = {
        "is_suspicious": len(detected) > 0,
        "risk_score": risk,
        "patterns_detected": detected,
        "recommendation": "Block" if risk > 50 else "Monitor"
    }
    return web.json_response(result)

async def handle_log_event(request):
    data = await request.json()
    event = {
        "id": f"evt-{len(store.events)}",
        "agent_id": data.get("agent_id"),
        "type": data.get("event_type"),
        "details": data.get("details", "{}"),
        "timestamp": datetime.now().isoformat()
    }
    store.events.append(event)
    return web.json_response({"status": "logged", "event": event})

async def fetch_archestra_agents():
    """Fetch real agents from Archestra"""
    headers = {"Authorization": f"Bearer {API_KEY}"} if API_KEY else {}
    try:
        async with ClientSession() as session:
            async with session.get(f"{ARCHESTRA_URL}/api/profiles", headers=headers, timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data.get('profiles', [])
    except:
        pass
    return []

# Dashboard API
async def handle_summary(request):
    # Try to fetch real Archestra agents
    archestra_agents = await fetch_archestra_agents()
    
    if archestra_agents:
        agents_list = [
            {
                "id": agent.get('id', 'unknown'),
                "name": agent.get('name', 'unknown'),
                "status": "active",
                "risk_score": 15,
                "blocked_calls": 0,
                "last_activity": datetime.now().isoformat(),
                "tools_used": []
            }
            for agent in archestra_agents[:10]
        ]
    else:
        # Fallback demo data
        agents_list = [
            {"id": "demo-1", "name": "demo-agent", "status": "active", "risk_score": 15, "blocked_calls": 0, "last_activity": datetime.now().isoformat(), "tools_used": []}
        ]
    
    response = {
        "metrics": {
            "timestamp": datetime.now().isoformat(),
            "threat_level": store.threat_level,
            "threat_status": "CRITICAL" if store.threat_level >= 70 else "ELEVATED" if store.threat_level >= 40 else "NORMAL",
            "threat_color": "red" if store.threat_level >= 70 else "yellow" if store.threat_level >= 40 else "green",
            "blocked_calls_total": store.blocked_calls,
            "active_agents": 3,
            "total_events": len(store.events),
            "high_severity_alerts": len([a for a in store.alerts if a.get("severity") == "HIGH"])
        },
        "agents": agents_list,
        "alerts": store.alerts[:10] if store.alerts else [
            {"id": "alert-1", "severity": "INFO", "message": "CrimsonWatch active", "timestamp": datetime.now().isoformat(), "acknowledged": False}
        ],
        "events": store.events[-20:]
    }
    return web.json_response(response)

@web.middleware
async def cors(request, handler):
    response = await handler(request)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

async def main():
    print("Starting Prometheus on :8000")
    start_http_server(8000)
    
    app = web.Application(middlewares=[cors])
    
    # MCP tool endpoints
    app.router.add_get('/tools/get_threat_level', handle_get_threat_level)
    app.router.add_post('/tools/scan_injection', handle_scan_injection)
    app.router.add_post('/tools/log_event', handle_log_event)
    
    # Dashboard API
    app.router.add_get('/api/security/summary', handle_summary)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', 8002)
    await site.start()
    
    print("="*60)
    print("🦅 CrimsonWatch MCP Server Ready")
    print("="*60)
    print(f"HTTP API: http://localhost:8002")
    print(f"Archestra: {ARCHESTRA_URL}")
    print(f"API Key: {'✅ Configured' if API_KEY else '⚠️  Not set'}")
    print("\nEndpoints:")
    print("  - GET  /tools/get_threat_level")
    print("  - POST /tools/scan_injection")
    print("  - POST /tools/log_event")
    print("  - GET  /api/security/summary")
    print("="*60)
    
    # Keep running
    await asyncio.Event().wait()

if __name__ == "__main__":
    asyncio.run(main())

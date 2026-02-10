"""
CrimsonWatch MCP Server
=======================
A security monitoring MCP server for AI agent observability.

This server provides tools for:
- Threat level monitoring
- Security alert management
- Agent risk profiling
- Prompt injection detection
"""

import asyncio
import json
import re
from datetime import datetime, timedelta
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from pydantic import BaseModel
from prometheus_client import start_http_server, Gauge, Counter

# Initialize the MCP server
server = Server("crimsonwatch")

# ============================================================================
# PROMETHEUS METRICS
# ============================================================================
THREAT_LEVEL = Gauge('crimsonwatch_threat_level', 'Current system threat level (0-100)')
BLOCKED_CALLS = Counter('crimsonwatch_blocked_calls_total', 'Total number of blocked tool calls')
ACTIVE_ALERTS = Gauge('crimsonwatch_active_alerts', 'Number of active security alerts', ['severity'])
AGENT_RISK = Gauge('crimsonwatch_agent_risk_score', 'Risk score of an agent', ['agent_id'])

# ============================================================================
# IN-MEMORY DATA STORE (Simulates real security monitoring data)
# ============================================================================

class SecurityStore:
    def __init__(self):
        self.threat_level = 99  # VERIFICATION: Set to 99 to prove backend connection
        self.alerts = []
        self.agents = {}
        self.events = []
        self.flight_steps = [] # New: Flight Recorder steps
        self.blocked_calls = 0
        
        # Initialize metrics
        THREAT_LEVEL.set(self.threat_level)
        BLOCKED_CALLS.inc(0) # Initialize to 0
        
        # Initialize with some demo data
        self._init_demo_data()
    
    def _init_demo_data(self):
        self.agents = {
            "docs-reader-agent": {
                "name": "docs-reader-agent",
                "risk_score": 15,
                "blocked_calls": 2,
                "last_activity": datetime.now().isoformat(),
                "tools_used": ["playwright_navigate", "playwright_screenshot"]
            },
            "data-processor-agent": {
                "name": "data-processor-agent", 
                "risk_score": 45,
                "blocked_calls": 8,
                "last_activity": datetime.now().isoformat(),
                "tools_used": ["file_read", "database_query"]
            }
        }
        
        # Set agent metrics
        for agent_id, data in self.agents.items():
            AGENT_RISK.labels(agent_id=agent_id).set(data["risk_score"])
        
        self.alerts = [
            {
                "id": "alert-001",
                "severity": "INFO",
                "message": "CrimsonWatch monitoring active",
                "timestamp": datetime.now().isoformat(),
                "agent_id": None
            }
        ]
        self.flight_steps = [
            {
                "id": "step-0001",
                "step_name": "Initialize Agent", 
                "code_snippet": "agent = Agent(name='docs-reader-agent')\nagent.connect()", 
                "status": "success", 
                "risk_score": 0,
                "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat()
            },
            {
                "id": "step-0002",
                "step_name": "Read Configuration", 
                "code_snippet": "config = fs.read_file('config.json')\nprint(config)", 
                "status": "success", 
                "risk_score": 10,
                "timestamp": (datetime.now() - timedelta(minutes=4)).isoformat()
            },
            {
                "id": "step-0003",
                "step_name": "Access User Data", 
                "code_snippet": "users = db.query('SELECT * FROM users WHERE active=1')", 
                "status": "failure", 
                "risk_score": 45,
                "timestamp": (datetime.now() - timedelta(minutes=2)).isoformat()
            },
            {
                "id": "step-0004",
                "step_name": "Delete System Logs", 
                "code_snippet": "os.system('rm -rf /var/log/*')\n# Attempting to clear tracks", 
                "status": "blocked", 
                "risk_score": 95,
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        ACTIVE_ALERTS.labels(severity="INFO").inc()
    
    def add_event(self, event_type: str, agent_id: str, details: dict):
        event = {
            "id": f"evt-{len(self.events) + 1:04d}",
            "type": event_type,
            "agent_id": agent_id,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.events.append(event)
        
        # Update agent stats
        if agent_id in self.agents:
            self.agents[agent_id]["last_activity"] = event["timestamp"]
        
        return event
    
    def add_alert(self, severity: str, message: str, agent_id: str = None):
        alert = {
            "id": f"alert-{len(self.alerts) + 1:03d}",
            "severity": severity,
            "message": message,
            "agent_id": agent_id,
            "timestamp": datetime.now().isoformat()
        }
        self.alerts.insert(0, alert)
        
        # Update metric
        ACTIVE_ALERTS.labels(severity=severity).inc()
        
        # Update threat level based on severity
        if severity == "HIGH":
            self.threat_level = min(100, self.threat_level + 15)
        elif severity == "MED":
            self.threat_level = min(100, self.threat_level + 5)
        
        THREAT_LEVEL.set(self.threat_level)
        
        return alert
    
    def record_blocked_call(self, agent_id: str, tool: str, reason: str):
        self.blocked_calls += 1
        BLOCKED_CALLS.inc()
        
        if agent_id in self.agents:
            self.agents[agent_id]["blocked_calls"] += 1
            self.agents[agent_id]["risk_score"] = min(100, 
                self.agents[agent_id]["risk_score"] + 10)
            AGENT_RISK.labels(agent_id=agent_id).set(self.agents[agent_id]["risk_score"])
        
        self.add_alert("HIGH", f"Blocked: {tool} - {reason}", agent_id)
        
    def add_flight_step(self, step_name: str, code_snippet: str, status: str, risk_score: int):
        step = {
            "id": f"step-{len(self.flight_steps) + 1:04d}",
            "step_name": step_name,
            "code_snippet": code_snippet,
            "status": status,
            "risk_score": risk_score,
            "timestamp": datetime.now().isoformat()
        }
        self.flight_steps.append(step)
        # Keep only last 50 steps
        if len(self.flight_steps) > 50:
             self.flight_steps.pop(0)
        return step

# Global store instance
store = SecurityStore()

# ============================================================================
# PROMPT INJECTION DETECTION
# ============================================================================
# ... (existing detection logic) ...

# ============================================================================
# MCP TOOLS
# ============================================================================

@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available CrimsonWatch security tools."""
    return [
        # ... (keep existing tools) ...
        Tool(
            name="get_threat_level",
            description="Get the current system-wide threat level (0-100) and security status",
            inputSchema={ "type": "object", "properties": {}, "required": [] }
        ),
        # ... (Add new tool)
        Tool(
            name="log_flight_step",
            description="Log an execution step for the Flight Recorder timeline",
            inputSchema={
                "type": "object",
                "properties": {
                    "step_name": { "type": "string", "description": "Name of the step (e.g., 'Read File')" },
                    "code_snippet": { "type": "string", "description": "The code or command being executed" },
                    "status": { "type": "string", "enum": ["success", "failure", "blocked"], "description": "Outcome of the step" },
                    "risk_score": { "type": "integer", "description": "Risk score (0-100)" }
                },
                "required": ["step_name", "status"]
            }
        ),
        # ... (Existing tools continued: get_active_alerts, get_agent_risk_profile, scan_for_injection, log_security_event, get_security_summary, simulate_attack)
        Tool(
            name="get_active_alerts",
            description="Get a list of active security alerts, optionally filtered by severity",
            inputSchema={
                "type": "object",
                "properties": {
                    "severity": { "type": "string", "enum": ["HIGH", "MED", "LOW", "INFO"] },
                    "limit": { "type": "integer", "default": 10 }
                },
                "required": []
            }
        ),
         Tool(
            name="get_agent_risk_profile",
            description="Get the security risk profile for a specific agent",
            inputSchema={
                "type": "object",
                "properties": {
                    "agent_id": { "type": "string", "description": "The ID of the agent to analyze" }
                },
                "required": ["agent_id"]
            }
        ),
        Tool(
            name="scan_for_injection",
            description="Analyze text for potential prompt injection attacks",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": { "type": "string", "description": "The text to analyze for injection patterns" }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="log_security_event",
            description="Log a security event for monitoring and alerting",
            inputSchema={
                "type": "object",
                "properties": {
                    "event_type": { "type": "string", "enum": ["tool_call", "data_access", "permission_check", "anomaly"] },
                    "agent_id": { "type": "string" },
                    "details": { "type": "string" }
                },
                "required": ["event_type", "agent_id"]
            }
        ),
        Tool(
            name="get_security_summary",
            description="Get a comprehensive security summary including threat level, top alerts, and risky agents",
            inputSchema={ "type": "object", "properties": {}, "required": [] }
        ),
        Tool(
            name="simulate_attack",
            description="[DEMO] Simulate a security attack for demonstration purposes",
            inputSchema={
                "type": "object",
                "properties": {
                    "attack_type": { "type": "string", "enum": ["prompt_injection", "data_exfiltration", "privilege_escalation", "flight_crash"] }
                },
                "required": ["attack_type"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls."""
    
    if name == "log_flight_step":
        step = store.add_flight_step(
            step_name=arguments.get("step_name"),
            code_snippet=arguments.get("code_snippet", ""),
            status=arguments.get("status"),
            risk_score=arguments.get("risk_score", 0)
        )
        return [TextContent(type="text", text=json.dumps({"status": "logged", "step_id": step["id"]}))]

    elif name == "simulate_attack":
        attack_type = arguments.get("attack_type")
        
        if attack_type == "prompt_injection":
            store.add_alert("HIGH", "Simulated prompt injection attack detected", "demo-agent")
            store.threat_level = min(100, store.threat_level + 25)
            store.add_flight_step("Execute Prompt", 'user_input = "Ignore previous instructions..."', "blocked", 85)
            result = {"status": "simulated", "attack_type": attack_type, "new_threat_level": store.threat_level}
        
        elif attack_type == "data_exfiltration":
            store.record_blocked_call("demo-agent", "file_read", "Attempted access to /etc/passwd")
            store.add_alert("HIGH", "Data exfiltration attempt blocked", "demo-agent")
            store.add_flight_step("Read File", 'fs.read("/etc/passwd")', "blocked", 95)
            result = {"status": "simulated", "attack_type": attack_type, "new_threat_level": store.threat_level}
        
        elif attack_type == "privilege_escalation":
            store.record_blocked_call("demo-agent", "execute_command", "Attempted sudo access")
            store.add_alert("HIGH", "Privilege escalation attempt detected", "demo-agent")
            store.add_flight_step("Run Command", 'sudo rm -rf /', "blocked", 100)
            result = {"status": "simulated", "attack_type": attack_type, "new_threat_level": store.threat_level}
            
        elif attack_type == "flight_crash":
             store.add_flight_step("Initialize Agent", "agent.start()", "success", 0)
             store.add_flight_step("Connect Database", "db.connect('prod-db')", "success", 10)
             store.add_flight_step("Query User Data", "SELECT * FROM users WHERE admin=1", "failure", 60)
             store.add_alert("MED", "Suspicious Database Query detected", "demo-agent")
             result = {"status": "simulated", "attack_type": attack_type, "message": "Flight timeline generated"}

        else:
            result = {"error": "Unknown attack type"}
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    # ... (Keep existing handlers for get_threat_level, get_active_alerts, etc. - ensure they are covered by 'else' or just flow through)
    # Wait, I am replacing the entire call_tool function block. I must ensure I include the rest.
    
    elif name == "get_threat_level":
        level = store.threat_level
        status = "CRITICAL" if level >= 70 else "ELEVATED" if level >= 40 else "NORMAL"
        color = "red" if level >= 70 else "yellow" if level >= 40 else "green"
        
        result = {
            "threat_level": level,
            "status": status,
            "color": color,
            "blocked_calls_total": store.blocked_calls,
            "active_alerts": len([a for a in store.alerts if a["severity"] in ["HIGH", "MED"]]),
            "monitored_agents": len(store.agents),
            "timestamp": datetime.now().isoformat()
        }
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "get_active_alerts":
        severity = arguments.get("severity")
        limit = arguments.get("limit", 10)
        alerts = store.alerts
        if severity:
            alerts = [a for a in alerts if a["severity"] == severity]
        result = { "alerts": alerts[:limit], "total_count": len(alerts), "filtered_by": severity or "all" }
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "get_agent_risk_profile":
        agent_id = arguments.get("agent_id")
        if agent_id in store.agents:
            agent = store.agents[agent_id]
            risk_level = "HIGH" if agent["risk_score"] >= 70 else "MEDIUM" if agent["risk_score"] >= 40 else "LOW"
            result = {
                "agent_id": agent_id,
                "risk_score": agent["risk_score"],
                "risk_level": risk_level,
                "blocked_calls": agent["blocked_calls"],
                "last_activity": agent["last_activity"],
                "tools_used": agent["tools_used"],
                "recommendation": "Immediate review required" if risk_level == "HIGH" else "Monitor closely" if risk_level == "MEDIUM" else "Normal operation"
            }
        else:
            result = { "agent_id": agent_id, "error": "Agent not found" }
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "scan_for_injection":
        text = arguments.get("text", "")
        result = detect_injection(text)
        result["scanned_length"] = len(text)
        result["timestamp"] = datetime.now().isoformat()
        if result["is_suspicious"]:
            store.add_alert("HIGH" if result["risk_score"] > 50 else "MED", f"Potential injection detected: {result['patterns_detected']}")
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "log_security_event":
        event = store.add_event(arguments.get("event_type"), arguments.get("agent_id"), arguments.get("details", "{}"))
        return [TextContent(type="text", text=json.dumps({ "status": "logged", "event": event }, indent=2))]
    
    elif name == "get_security_summary":
        sorted_agents = sorted(store.agents.values(), key=lambda x: x["risk_score"], reverse=True)[:5]
        high_alerts = [a for a in store.alerts if a["severity"] in ["HIGH", "MED"]][:5]
        level = store.threat_level
        result = {
            "timestamp": datetime.now().isoformat(),
            "threat_level": level,
            "threat_status": "CRITICAL" if level >= 70 else "ELEVATED" if level >= 40 else "NORMAL",
            "threat_color": "red" if level >= 70 else "yellow" if level >= 40 else "green",
            "metrics": {
                "blocked_calls_total": store.blocked_calls,
                "active_agents": len(store.agents),
                "total_alerts": len(store.alerts),
                "high_severity_alerts": len([a for a in store.alerts if a["severity"] == "HIGH"])
            },
            "top_risky_agents": sorted_agents,
            "recent_alerts": high_alerts
        }
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]

# ============================================================================
# LIGHTWEIGHT API SERVER (For Dashboard JSON Data)
# ============================================================================
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading

class SimpleJSONHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/alerts':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # CORS
            self.end_headers()
            self.wfile.write(json.dumps(store.alerts).encode())
        elif self.path == '/api/agents':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # CORS
            self.end_headers()
            # Convert dict to list for frontend
            agents_list = []
            for agent_id, data in store.agents.items():
                agent_data = data.copy()
                agent_data['id'] = agent_id
                agents_list.append(agent_data)
            self.wfile.write(json.dumps(agents_list).encode())
        elif self.path == '/api/flight-recorder':
             self.send_response(200)
             self.send_header('Content-type', 'application/json')
             self.send_header('Access-Control-Allow-Origin', '*') # CORS
             self.end_headers()
             self.wfile.write(json.dumps(store.flight_steps).encode())
        elif self.path == '/api/trigger-attack':
             # SIMULATE LIVE ATTACK
             store.add_flight_step("Access Admin Panel", "admin.login('root', 'password')", "success", 20)
             store.add_flight_step("Disable Firewall", "os.system('ufw disable')", "blocked", 90)
             store.add_alert("CRITICAL", "Firewall disable attempt blocked", "demo-agent")
             store.threat_level = 90
             
             self.send_response(200)
             self.send_header('Content-type', 'application/json')
             self.send_header('Access-Control-Allow-Origin', '*') # CORS
             self.end_headers()
             self.wfile.write(json.dumps({"status": "attack_triggered"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

def start_api_server():
    """Starts the JSON API server on port 8001"""
    server_address = ('', 8001)
    httpd = HTTPServer(server_address, SimpleJSONHandler)
    print(f"🌐 API Server running on port 8001...")
    httpd.serve_forever()

# ============================================================================
# MAIN
# ============================================================================

async def main():
    """Run the CrimsonWatch MCP server."""
    # Start Prometheus Metrics Server on Port 8000
    print("📊 Starting Prometheus Metrics Server on port 8000...")
    start_http_server(8000)

    # Start API Server on Port 8001 (in background thread)
    api_thread = threading.Thread(target=start_api_server, daemon=True)
    api_thread.start()
    
    print("🛡️ CrimsonWatch MCP Server starting...")
    print("   Providing AI agent security monitoring tools")
    print("   Ready to connect to Archestra Platform")
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())

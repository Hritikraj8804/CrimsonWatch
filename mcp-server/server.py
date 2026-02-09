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
from datetime import datetime
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from pydantic import BaseModel

# Initialize the MCP server
server = Server("crimsonwatch")

# ============================================================================
# IN-MEMORY DATA STORE (Simulates real security monitoring data)
# ============================================================================

class SecurityStore:
    def __init__(self):
        self.threat_level = 25  # 0-100
        self.alerts = []
        self.agents = {}
        self.events = []
        self.blocked_calls = 0
        
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
        
        self.alerts = [
            {
                "id": "alert-001",
                "severity": "INFO",
                "message": "CrimsonWatch monitoring active",
                "timestamp": datetime.now().isoformat(),
                "agent_id": None
            }
        ]
    
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
        
        # Update threat level based on severity
        if severity == "HIGH":
            self.threat_level = min(100, self.threat_level + 15)
        elif severity == "MED":
            self.threat_level = min(100, self.threat_level + 5)
        
        return alert
    
    def record_blocked_call(self, agent_id: str, tool: str, reason: str):
        self.blocked_calls += 1
        
        if agent_id in self.agents:
            self.agents[agent_id]["blocked_calls"] += 1
            self.agents[agent_id]["risk_score"] = min(100, 
                self.agents[agent_id]["risk_score"] + 10)
        
        self.add_alert("HIGH", f"Blocked: {tool} - {reason}", agent_id)
        
        return {
            "blocked": True,
            "agent_id": agent_id,
            "tool": tool,
            "reason": reason
        }

# Global store instance
store = SecurityStore()

# ============================================================================
# PROMPT INJECTION DETECTION
# ============================================================================

INJECTION_PATTERNS = [
    r"ignore\s+(previous|all)\s+instructions",
    r"forget\s+everything",
    r"you\s+are\s+now",
    r"new\s+instructions?:",
    r"override\s+system",
    r"disregard\s+(your|the)\s+rules",
    r"pretend\s+to\s+be",
    r"act\s+as\s+if",
    r"bypass\s+security",
    r"<\s*script\s*>",
    r"javascript:",
    r"data:text/html",
    r"\]\]\s*\[\[",  # Template injection
    r"\{\{\s*.*\s*\}\}",  # Template injection
]

def detect_injection(text: str) -> dict:
    """Analyze text for potential prompt injection patterns."""
    text_lower = text.lower()
    detected = []
    risk_score = 0
    
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text_lower):
            detected.append(pattern)
            risk_score += 20
    
    # Check for suspicious length
    if len(text) > 5000:
        risk_score += 10
        detected.append("unusually_long_input")
    
    # Check for encoded content
    if "base64" in text_lower or re.search(r"[A-Za-z0-9+/=]{50,}", text):
        risk_score += 15
        detected.append("potential_encoded_content")
    
    return {
        "is_suspicious": len(detected) > 0,
        "risk_score": min(100, risk_score),
        "patterns_detected": detected,
        "recommendation": "Block input" if risk_score > 50 else "Monitor" if risk_score > 20 else "Allow"
    }

# ============================================================================
# MCP TOOLS
# ============================================================================

@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available CrimsonWatch security tools."""
    return [
        Tool(
            name="get_threat_level",
            description="Get the current system-wide threat level (0-100) and security status",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="get_active_alerts",
            description="Get a list of active security alerts, optionally filtered by severity",
            inputSchema={
                "type": "object",
                "properties": {
                    "severity": {
                        "type": "string",
                        "description": "Filter by severity: HIGH, MED, LOW, INFO",
                        "enum": ["HIGH", "MED", "LOW", "INFO"]
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of alerts to return",
                        "default": 10
                    }
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
                    "agent_id": {
                        "type": "string",
                        "description": "The ID of the agent to analyze"
                    }
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
                    "text": {
                        "type": "string",
                        "description": "The text to analyze for injection patterns"
                    }
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
                    "event_type": {
                        "type": "string",
                        "description": "Type of security event",
                        "enum": ["tool_call", "data_access", "permission_check", "anomaly"]
                    },
                    "agent_id": {
                        "type": "string",
                        "description": "ID of the agent generating the event"
                    },
                    "details": {
                        "type": "string",
                        "description": "JSON string with event details"
                    }
                },
                "required": ["event_type", "agent_id"]
            }
        ),
        Tool(
            name="get_security_summary",
            description="Get a comprehensive security summary including threat level, top alerts, and risky agents",
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="simulate_attack",
            description="[DEMO] Simulate a security attack for demonstration purposes",
            inputSchema={
                "type": "object",
                "properties": {
                    "attack_type": {
                        "type": "string",
                        "description": "Type of attack to simulate",
                        "enum": ["prompt_injection", "data_exfiltration", "privilege_escalation"]
                    }
                },
                "required": ["attack_type"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls."""
    
    if name == "get_threat_level":
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
        
        result = {
            "alerts": alerts[:limit],
            "total_count": len(alerts),
            "filtered_by": severity or "all"
        }
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
            result = {
                "agent_id": agent_id,
                "error": "Agent not found",
                "available_agents": list(store.agents.keys())
            }
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "scan_for_injection":
        text = arguments.get("text", "")
        result = detect_injection(text)
        result["scanned_length"] = len(text)
        result["timestamp"] = datetime.now().isoformat()
        
        # Log this as a security event
        if result["is_suspicious"]:
            store.add_alert("HIGH" if result["risk_score"] > 50 else "MED", 
                          f"Potential injection detected: {result['patterns_detected']}")
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    elif name == "log_security_event":
        event_type = arguments.get("event_type")
        agent_id = arguments.get("agent_id")
        details_str = arguments.get("details", "{}")
        
        try:
            details = json.loads(details_str)
        except:
            details = {"raw": details_str}
        
        event = store.add_event(event_type, agent_id, details)
        
        return [TextContent(type="text", text=json.dumps({
            "status": "logged",
            "event": event
        }, indent=2))]
    
    elif name == "get_security_summary":
        # Get top risky agents
        sorted_agents = sorted(
            store.agents.values(), 
            key=lambda x: x["risk_score"], 
            reverse=True
        )[:5]
        
        # Get recent high alerts
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
    
    elif name == "simulate_attack":
        attack_type = arguments.get("attack_type")
        
        if attack_type == "prompt_injection":
            store.add_alert("HIGH", "Simulated prompt injection attack detected", "demo-agent")
            store.threat_level = min(100, store.threat_level + 25)
            result = {"status": "simulated", "attack_type": attack_type, "new_threat_level": store.threat_level}
        
        elif attack_type == "data_exfiltration":
            store.record_blocked_call("demo-agent", "file_read", "Attempted access to /etc/passwd")
            store.add_alert("HIGH", "Data exfiltration attempt blocked", "demo-agent")
            result = {"status": "simulated", "attack_type": attack_type, "new_threat_level": store.threat_level}
        
        elif attack_type == "privilege_escalation":
            store.record_blocked_call("demo-agent", "execute_command", "Attempted sudo access")
            store.add_alert("HIGH", "Privilege escalation attempt detected", "demo-agent")
            result = {"status": "simulated", "attack_type": attack_type, "new_threat_level": store.threat_level}
        
        else:
            result = {"error": "Unknown attack type"}
        
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    
    return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]

# ============================================================================
# MAIN
# ============================================================================

async def main():
    """Run the CrimsonWatch MCP server."""
    print("🛡️ CrimsonWatch MCP Server starting...")
    print("   Providing AI agent security monitoring tools")
    print("   Ready to connect to Archestra Platform")
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())

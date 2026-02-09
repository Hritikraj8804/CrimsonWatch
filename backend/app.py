from flask import Flask, jsonify
from flask_cors import CORS
import os
import requests
import time
from datetime import datetime, timedelta
from threading import Thread, Lock
import random

app = Flask(__name__)
CORS(app)

# --- Configuration ---
PROMETHEUS_URL = os.getenv("PROMETHEUS_URL", "http://localhost:9090")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))

# --- Data Store ---
class DataStore:
    def __init__(self):
        self.events = []
        self.incidents = []
        self.agents = {}
        self.metrics = {
            "threat_level": 0,
            "blocked_calls_total": 0,
            "active_agents": 0,
            "high_risk_tools": 0,
            "perm_violations": 0
        }
        self.lock = Lock()
    
    def add_event(self, event):
        with self.lock:
            self.events.append(event)
            # Keep only last 1000 events
            if len(self.events) > 1000:
                self.events = self.events[-1000:]
    
    def add_incident(self, incident):
        with self.lock:
            # Check if similar incident exists within 5 minutes
            existing = None
            for inc in self.incidents:
                if (inc["agent_id"] == incident["agent_id"] and 
                    inc["type"] == incident["type"] and
                    (datetime.now() - datetime.fromisoformat(inc["timestamp"])).seconds < 300):
                    existing = inc
                    break
            
            if existing:
                existing["events_count"] += incident["events_count"]
                existing["timestamp"] = incident["timestamp"]
                existing["severity"] = self._calculate_severity(existing["events_count"])
            else:
                self.incidents.insert(0, incident)
                if len(self.incidents) > 100:
                    self.incidents = self.incidents[:100]
    
    def _calculate_severity(self, count):
        if count >= 10:
            return "HIGH"
        elif count >= 5:
            return "MED"
        return "LOW"
    
    def update_agent(self, agent_id, risk_delta, blocked_delta=0):
        with self.lock:
            if agent_id not in self.agents:
                self.agents[agent_id] = {
                    "name": agent_id,
                    "risk_score": 0,
                    "blocked_calls_24h": 0,
                    "last_incident": None
                }
            
            self.agents[agent_id]["risk_score"] = min(100, self.agents[agent_id]["risk_score"] + risk_delta)
            self.agents[agent_id]["blocked_calls_24h"] += blocked_delta
            self.agents[agent_id]["last_incident"] = datetime.now().isoformat()
    
    def update_metrics(self, blocked=0, high_risk=0, perm_violations=0):
        with self.lock:
            self.metrics["blocked_calls_total"] += blocked
            self.metrics["high_risk_tools"] += high_risk
            self.metrics["perm_violations"] += perm_violations
            self.metrics["active_agents"] = len(self.agents)
            
            # Calculate threat level: (BlockedCalls * 2) + (HighRiskToolUses * 5) + (PermViolations * 10)
            score = (self.metrics["blocked_calls_total"] * 2 + 
                    self.metrics["high_risk_tools"] * 5 + 
                    self.metrics["perm_violations"] * 10)
            
            # Normalize to 0-100 with decay
            self.metrics["threat_level"] = min(100, max(0, score))
    
    def decay_risk(self):
        """Gradually reduce risk scores over time"""
        with self.lock:
            for agent in self.agents.values():
                agent["risk_score"] = max(0, agent["risk_score"] - 1)
    
    def get_state(self):
        with self.lock:
            return {
                "metrics": self.metrics.copy(),
                "incidents": self.incidents.copy(),
                "agents": sorted(self.agents.values(), key=lambda x: x["risk_score"], reverse=True),
                "events": self.events[-50:].copy()
            }

data_store = DataStore()

# --- Threat Detection Rules ---
class ThreatDetector:
    RULES = [
        {
            "name": "Brute Force Attack",
            "pattern": lambda e: e.get("type") == "blocked_call" and e.get("count", 0) >= 5,
            "risk_score": 15,
            "severity": "HIGH",
            "action": "Review agent permissions and implement rate limiting"
        },
        {
            "name": "Permission Violation",
            "pattern": lambda e: e.get("type") == "permission_denied",
            "risk_score": 25,
            "severity": "HIGH", 
            "action": "Immediately revoke unauthorized access attempts"
        },
        {
            "name": "High-Risk Tool Usage",
            "pattern": lambda e: e.get("tool") in ["file_delete", "system_exec", "network_send"],
            "risk_score": 20,
            "severity": "MED",
            "action": "Audit tool usage and verify business justification"
        },
        {
            "name": "Suspicious Data Access",
            "pattern": lambda e: e.get("type") == "data_access" and e.get("sensitivity") == "high",
            "risk_score": 10,
            "severity": "MED",
            "action": "Review data access patterns"
        },
        {
            "name": "Anomalous Behavior",
            "pattern": lambda e: e.get("anomaly_score", 0) > 0.8,
            "risk_score": 12,
            "severity": "MED",
            "action": "Investigate agent behavior deviation"
        }
    ]
    
    @classmethod
    def analyze(cls, event):
        detected = []
        for rule in cls.RULES:
            if rule["pattern"](event):
                detected.append({
                    "rule_name": rule["name"],
                    "risk_score": rule["risk_score"],
                    "severity": rule["severity"],
                    "action": rule["action"]
                })
        return detected

# --- Prometheus Integration ---
class PrometheusClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def query(self, query_str):
        try:
            resp = requests.get(
                f"{self.base_url}/api/v1/query",
                params={"query": query_str},
                timeout=5
            )
            if resp.status_code == 200:
                return resp.json()
        except Exception as e:
            print(f"Prometheus query failed: {e}")
        return None
    
    def fetch_metrics(self):
        """Simulate fetching metrics from Prometheus"""
        # In real implementation, this would query actual Prometheus metrics
        # For hackathon demo, we generate realistic mock data
        
        agents = ["support-bot-alpha", "data-agent-beta", "web-scraper-gamma", 
                 "email-handler-delta", "report-generator-epsilon"]
        
        events = []
        
        # Generate random events based on probability
        if random.random() < 0.3:  # 30% chance of blocked call
            agent = random.choice(agents)
            events.append({
                "timestamp": datetime.now().isoformat(),
                "agent_id": agent,
                "type": "blocked_call",
                "count": random.randint(1, 8),
                "tool": random.choice(["read_file", "write_file", "api_call", "database_query"]),
                "reason": "Rate limit exceeded"
            })
        
        if random.random() < 0.15:  # 15% chance of permission violation
            agent = random.choice(agents)
            events.append({
                "timestamp": datetime.now().isoformat(),
                "agent_id": agent,
                "type": "permission_denied",
                "tool": random.choice(["file_delete", "system_exec", "admin_access"]),
                "reason": "Unauthorized access attempt"
            })
        
        if random.random() < 0.2:  # 20% chance of high-risk tool usage
            agent = random.choice(agents)
            events.append({
                "timestamp": datetime.now().isoformat(),
                "agent_id": agent,
                "type": "tool_usage",
                "tool": random.choice(["file_delete", "system_exec", "network_send"]),
                "context": "Production environment"
            })
        
        if random.random() < 0.1:  # 10% chance of data access
            agent = random.choice(agents)
            events.append({
                "timestamp": datetime.now().isoformat(),
                "agent_id": agent,
                "type": "data_access",
                "sensitivity": random.choice(["low", "medium", "high"]),
                "records": random.randint(10, 1000)
            })
        
        return events

prom_client = PrometheusClient(PROMETHEUS_URL)

# --- Background Polling ---
def poll_metrics():
    """Background thread to continuously poll metrics"""
    while True:
        try:
            # Fetch events from Prometheus (or mock)
            events = prom_client.fetch_metrics()
            
            for event in events:
                # Store event
                data_store.add_event(event)
                
                # Analyze for threats
                threats = ThreatDetector.analyze(event)
                
                for threat in threats:
                    # Create incident
                    incident = {
                        "id": f"inc_{int(time.time() * 1000)}_{random.randint(1000, 9999)}",
                        "severity": threat["severity"],
                        "timestamp": event["timestamp"],
                        "description": threat["rule_name"],
                        "agent_id": event["agent_id"],
                        "events_count": 1,
                        "suggested_action": threat["action"],
                        "type": threat["rule_name"]
                    }
                    
                    data_store.add_incident(incident)
                    
                    # Update agent risk score
                    blocked = 1 if event.get("type") == "blocked_call" else 0
                    data_store.update_agent(event["agent_id"], threat["risk_score"], blocked)
                    
                    # Update global metrics
                    high_risk = 1 if threat["rule_name"] == "High-Risk Tool Usage" else 0
                    perm_violation = 1 if event.get("type") == "permission_denied" else 0
                    data_store.update_metrics(blocked, high_risk, perm_violation)
            
            # Decay risk scores periodically
            if random.random() < 0.1:
                data_store.decay_risk()
                
        except Exception as e:
            print(f"Error in poll_metrics: {e}")
        
        time.sleep(POLL_INTERVAL)

# Start background polling
poll_thread = Thread(target=poll_metrics, daemon=True)
poll_thread.start()

# --- API Routes ---

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Returns global dashboard metrics"""
    state = data_store.get_state()
    metrics = state["metrics"]
    
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "threat_level": metrics["threat_level"],
        "blocked_calls_total": metrics["blocked_calls_total"],
        "active_agents": metrics["active_agents"],
        "high_risk_tools": metrics["high_risk_tools"],
        "perm_violations": metrics["perm_violations"]
    })

@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    """Returns list of security incidents"""
    limit = request.args.get('limit', 10, type=int)
    state = data_store.get_state()
    incidents = state["incidents"][:limit]
    return jsonify(incidents)

@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Returns agent leaderboard sorted by risk"""
    state = data_store.get_state()
    return jsonify(state["agents"])

@app.route('/api/events', methods=['GET'])
def get_events():
    """Returns raw events for debugging"""
    state = data_store.get_state()
    return jsonify(state["events"])

@app.route('/api/threat-summary', methods=['GET'])
def get_threat_summary():
    """Returns comprehensive threat summary"""
    state = data_store.get_state()
    metrics = state["metrics"]
    
    # Determine threat status
    level = metrics["threat_level"]
    if level < 30:
        status = "LOW"
        color = "green"
    elif level < 70:
        status = "MEDIUM"
        color = "yellow"
    else:
        status = "CRITICAL"
        color = "red"
    
    # Get recent high-severity incidents
    high_risk_incidents = [i for i in state["incidents"] if i["severity"] == "HIGH"][:5]
    
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "threat_level": level,
        "threat_status": status,
        "threat_color": color,
        "active_incidents": len(state["incidents"]),
        "high_risk_incidents": high_risk_incidents,
        "top_risky_agents": state["agents"][:3],
        "metrics": metrics
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "CrimsonWatch-Backend",
        "prometheus_url": PROMETHEUS_URL,
        "poll_interval": POLL_INTERVAL
    })

from flask import request

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

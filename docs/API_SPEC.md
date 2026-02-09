# API Specification (OpenAPI 3.0 Draft)

**Base URL**: `http://localhost:5000/api`

## Endpoints

### 1. Get Dashboard Metrics
**GET** `/metrics`
Returns global counters and the current threat score.

**Response**:
```json
{
  "timestamp": "2023-10-27T10:00:00Z",
  "threat_level": 75,
  "blocked_calls_total": 128,
  "active_agents": 5
}
```

### 2. Get Incidents (Timeline)
**GET** `/incidents`
Returns a list of correlated security incidents (recent first).

**Parameters**:
- `limit`: (Optional) Number of incidents to return. Default 10.

**Response**:
```json
[
  {
    "id": "inc_123",
    "severity": "HIGH", // LOW, MED, HIGH
    "timestamp": "2023-10-27T09:55:00Z",
    "description": "Potential Data Exfiltration",
    "agent_id": "support-bot-alpha",
    "events_count": 5,
    "suggested_action": "Revoke 'read_file' permission"
  }
]
```

### 3. Get Agent Leaderboard
**GET** `/agents`
Returns list of agents sorted by risk.

**Response**:
```json
[
  {
    "name": "support-bot-alpha",
    "risk_score": 88,
    "blocked_calls_24h": 42,
    "last_incident": "2023-10-27T09:55:00Z"
  }
]
```

### 4. Get Raw Events (Debug)
**GET** `/events`
Passthrough of raw Prometheus data for debugging.

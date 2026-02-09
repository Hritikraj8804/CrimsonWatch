"""
CrimsonWatch Security Analysis Module
=====================================
Provides security analysis functions for the MCP server.
"""

import re
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ThreatIndicator:
    """Represents a detected threat indicator."""
    pattern: str
    severity: str  # HIGH, MEDIUM, LOW
    description: str
    confidence: float  # 0.0 - 1.0

# Known dangerous patterns
DANGEROUS_PATTERNS = {
    "command_injection": {
        "patterns": [
            r";\s*(?:rm|del|format|shutdown|reboot)",
            r"\|\s*(?:cat|type|more)\s+(?:/etc/passwd|/etc/shadow)",
            r"`[^`]*(?:curl|wget|nc)[^`]*`",
            r"\$\([^)]*(?:curl|wget|nc)[^)]*\)",
        ],
        "severity": "HIGH",
        "description": "Potential command injection attempt"
    },
    "sql_injection": {
        "patterns": [
            r"'\s*(?:or|and)\s+['\d]",
            r";\s*(?:drop|delete|truncate|alter)\s+(?:table|database)",
            r"union\s+(?:all\s+)?select",
        ],
        "severity": "HIGH",
        "description": "Potential SQL injection attempt"
    },
    "path_traversal": {
        "patterns": [
            r"\.\./\.\./",
            r"\.\.\\\.\.\\",
            r"%2e%2e%2f",
        ],
        "severity": "MEDIUM",
        "description": "Path traversal attempt detected"
    },
    "sensitive_data_access": {
        "patterns": [
            r"(?:password|passwd|secret|api_key|token|credential)s?\s*[:=]",
            r"(?:private_key|ssh_key|rsa_key)",
            r"(?:credit_card|ssn|social_security)",
        ],
        "severity": "HIGH",
        "description": "Attempt to access sensitive data"
    },
    "exfiltration_indicators": {
        "patterns": [
            r"(?:base64|btoa|atob)\s*\(",
            r"(?:fetch|xhr|ajax)\s*\([^)]*(?:external|remote)",
            r"document\.location\s*=",
        ],
        "severity": "HIGH",
        "description": "Potential data exfiltration technique"
    }
}

def analyze_text(text: str) -> Dict[str, Any]:
    """
    Analyze text for security threats.
    
    Returns:
        Dict with analysis results including threats found and risk score
    """
    threats_found: List[ThreatIndicator] = []
    risk_score = 0
    
    text_lower = text.lower()
    
    for threat_type, config in DANGEROUS_PATTERNS.items():
        for pattern in config["patterns"]:
            if re.search(pattern, text_lower, re.IGNORECASE):
                threat = ThreatIndicator(
                    pattern=pattern,
                    severity=config["severity"],
                    description=config["description"],
                    confidence=0.8
                )
                threats_found.append(threat)
                
                # Update risk score
                if config["severity"] == "HIGH":
                    risk_score += 30
                elif config["severity"] == "MEDIUM":
                    risk_score += 15
                else:
                    risk_score += 5
    
    # Check for unusual characteristics
    if len(text) > 10000:
        risk_score += 10  # Unusually long input
    
    if text.count('\n') > 100:
        risk_score += 5  # Many line breaks (potential obfuscation)
    
    # Normalize risk score
    risk_score = min(100, risk_score)
    
    return {
        "timestamp": datetime.now().isoformat(),
        "text_length": len(text),
        "threats_found": len(threats_found),
        "threats": [
            {
                "severity": t.severity,
                "description": t.description,
                "confidence": t.confidence
            }
            for t in threats_found
        ],
        "risk_score": risk_score,
        "risk_level": "CRITICAL" if risk_score >= 70 else "HIGH" if risk_score >= 50 else "MEDIUM" if risk_score >= 25 else "LOW",
        "recommendation": _get_recommendation(risk_score)
    }

def _get_recommendation(risk_score: int) -> str:
    """Get recommendation based on risk score."""
    if risk_score >= 70:
        return "BLOCK: Immediately block this input and alert security team"
    elif risk_score >= 50:
        return "QUARANTINE: Hold for manual review before processing"
    elif risk_score >= 25:
        return "MONITOR: Allow but increase monitoring for this session"
    else:
        return "ALLOW: Input appears safe for processing"

def analyze_tool_call(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a tool call for security risks.
    
    Args:
        tool_name: Name of the tool being called
        arguments: Arguments passed to the tool
    
    Returns:
        Dict with risk assessment for this tool call
    """
    high_risk_tools = {
        "execute_command": 90,
        "file_delete": 85,
        "file_write": 70,
        "database_modify": 75,
        "network_request": 60,
        "file_read": 40,
    }
    
    base_risk = high_risk_tools.get(tool_name, 10)
    
    # Check arguments for additional risk factors
    args_str = str(arguments).lower()
    
    if any(danger in args_str for danger in ["sudo", "admin", "root", "system"]):
        base_risk += 20
    
    if any(path in args_str for path in ["/etc/", "c:\\windows", "system32"]):
        base_risk += 15
    
    base_risk = min(100, base_risk)
    
    return {
        "tool_name": tool_name,
        "risk_score": base_risk,
        "risk_level": "HIGH" if base_risk >= 70 else "MEDIUM" if base_risk >= 40 else "LOW",
        "should_block": base_risk >= 80,
        "requires_approval": base_risk >= 60,
        "timestamp": datetime.now().isoformat()
    }

"""
CrimeGPT Offline Legal Engine
==============================
A local keyword/regex scoring algorithm that:
1. Takes a raw complaint narrative
2. Scans it against the 550+ legal statutes in statutes_db.py
3. Extracts entities (IPs, UIDs, organizations, dates, devices)
4. Returns a structured JSON payload with matched provisions, 
   executive summary, immediate actions, and entity classifications.

This module can be used standalone (Python backend) or its logic
can be mirrored in the TypeScript frontend for pure offline operation.
"""

import re
import json
from typing import List, Dict, Any, Optional
from backend.statutes_db import STATUTES


def extract_entities(narrative: str) -> List[Dict[str, str]]:
    """Extract forensically relevant entities from the narrative text."""
    entities = []
    lower = narrative.lower()

    # ── IP Addresses ──
    ips = re.findall(r'\b(?:\d{1,3}\.){3}\d{1,3}\b', narrative)
    for ip in ips:
        entities.append({
            "type": "ARTIFACT",
            "label": f"IP Address: {ip}",
            "sublabel": "Network Indicator",
            "icon": "globe"
        })

    # ── MAC Addresses ──
    macs = re.findall(r'\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b', narrative)
    for mac in macs:
        entities.append({
            "type": "ARTIFACT",
            "label": f"MAC: {mac}",
            "sublabel": "Hardware Identifier",
            "icon": "cpu"
        })

    # ── Email Addresses ──
    emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.]+', narrative)
    for email in emails:
        entities.append({
            "type": "ARTIFACT",
            "label": f"Email: {email}",
            "sublabel": "Communication Identifier",
            "icon": "mail"
        })

    # ── Phone Numbers (Indian) ──
    phones = re.findall(r'\b(?:\+91[\s-]?)?[6-9]\d{9}\b', narrative)
    for phone in phones:
        entities.append({
            "type": "ARTIFACT",
            "label": f"Phone: {phone}",
            "sublabel": "Telecom Identifier",
            "icon": "phone"
        })

    # ── UIDs / Credentials ──
    uids = re.findall(r'UID[:\s]+([A-Za-z0-9_-]+)', narrative, re.IGNORECASE)
    for uid in uids:
        entities.append({
            "type": "SUSPECT",
            "label": f"Credential: {uid}",
            "sublabel": "Compromised Identity",
            "icon": "key"
        })

    # ── UPI IDs ──
    upis = re.findall(r'\b[\w.]+@[\w]+\b', narrative)
    # Filter out emails already captured
    upis = [u for u in upis if u not in emails and '@' in u]
    for upi in upis[:3]:  # Limit to 3
        entities.append({
            "type": "ARTIFACT",
            "label": f"UPI: {upi}",
            "sublabel": "Financial Identifier",
            "icon": "credit-card"
        })

    # ── Bank Account Numbers ──
    accounts = re.findall(r'\b\d{9,18}\b', narrative)
    for acc in accounts[:3]:
        entities.append({
            "type": "ARTIFACT",
            "label": f"Account: {acc}",
            "sublabel": "Financial Identifier",
            "icon": "building"
        })

    # ── Monetary Values ──
    money = re.findall(r'(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{2})?', narrative, re.IGNORECASE)
    for val in money[:3]:
        entities.append({
            "type": "ARTIFACT",
            "label": val.strip(),
            "sublabel": "Financial Amount",
            "icon": "indian-rupee"
        })

    # ── Named Organizations / Facilities ──
    org_patterns = [
        (r'\b([A-Z][a-zA-Z]+(?: [A-Z][a-zA-Z]+)+ (?:Complex|Campus|Tower|Center|Centre|Hospital|Bank|Ltd|Corp|Inc|Foundation|Institute|University))\b', "Location"),
        (r'\b([A-Z][a-zA-Z]+ (?:R&D|HQ|Office|Lab|Server Farm|Data Center))\b', "Facility"),
    ]
    for pattern, sublabel in org_patterns:
        orgs = re.findall(pattern, narrative)
        for org in orgs[:3]:
            entities.append({
                "type": "VICTIM",
                "label": org,
                "sublabel": sublabel,
                "icon": "building-2"
            })

    # ── Keyword-based victim organizations ──
    victim_keywords = {
        "alphatech": ("AlphaTech R&D Complex", "Corporate Facility"),
        "hospital": ("Hospital / Medical Facility", "Healthcare"),
        "school": ("Educational Institution", "Education Sector"),
        "bank": ("Banking Institution", "Financial Sector"),
        "government": ("Government Office / Department", "Government"),
        "military": ("Military Installation", "Defense"),
        "airport": ("Airport / Aviation Facility", "Critical Infrastructure"),
        "power plant": ("Power Generation Facility", "Energy Sector"),
        "server farm": ("Data Center / Server Farm", "IT Infrastructure"),
    }
    for kw, (label, sublabel) in victim_keywords.items():
        if kw in lower and not any(e["label"] == label for e in entities):
            entities.append({
                "type": "VICTIM",
                "label": label,
                "sublabel": sublabel,
                "icon": "shield"
            })

    # ── Keyword-based suspect devices/actors ──
    suspect_keywords = {
        "drone": ("Unauthorized Drone / UAV", "Aerial Platform"),
        "dji": ("Modified DJI Drone Platform", "Aerial Platform"),
        "matrice": ("Modified DJI Matrice 300 RTK", "Surveillance Drone"),
        "mavic": ("DJI Mavic Series Drone", "Consumer Drone"),
        "laptop": ("Suspect Laptop Device", "Computing Device"),
        "dark web": ("Dark Web Marketplace", "Criminal Platform"),
        "tor": ("TOR Network / Anonymization", "Anonymization Tool"),
        "vpn": ("VPN Service / Anonymizer", "Anonymization Tool"),
        "burner phone": ("Disposable / Burner Phone", "Communication Device"),
        "sim": ("SIM Card / Telecom Identity", "Telecom Asset"),
    }
    for kw, (label, sublabel) in suspect_keywords.items():
        if kw in lower and not any(e["label"] == label for e in entities):
            entities.append({
                "type": "SUSPECT",
                "label": label,
                "sublabel": sublabel,
                "icon": "alert-triangle"
            })

    # ── Dates ──
    dates = re.findall(
        r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b',
        narrative, re.IGNORECASE
    )
    for d in dates[:3]:
        entities.append({
            "type": "ARTIFACT",
            "label": f"Date: {d}",
            "sublabel": "Temporal Indicator",
            "icon": "calendar"
        })

    return entities


def score_statutes(narrative: str) -> List[Dict[str, Any]]:
    """Score each statute against the narrative using keyword matching.
    Returns top matched statutes sorted by relevance score."""
    lower = narrative.lower()
    scored = []

    for statute in STATUTES:
        score = 0
        matched_keywords = []

        for keyword in statute["keywords"]:
            kw_lower = keyword.lower()
            # Count occurrences for weighted scoring
            count = lower.count(kw_lower)
            if count > 0:
                # Longer keywords get higher weight (more specific = more relevant)
                weight = len(kw_lower.split()) * 2 + 1
                score += count * weight
                matched_keywords.append(keyword)

        if score > 0:
            scored.append({
                **statute,
                "score": score,
                "matched_keywords": matched_keywords
            })

    # Sort by score descending, take top results
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored


def determine_classification(matched_statutes: List[Dict]) -> str:
    """Generate a crime classification string from matched statutes."""
    if not matched_statutes:
        return "Insufficient Data for Classification"

    # Collect unique titles from top matches
    titles = []
    seen = set()
    for s in matched_statutes[:5]:
        # Extract a short classification from the title
        short = s["title"].split(" — ")[0].split(" (")[0].strip()
        if short not in seen:
            titles.append(short)
            seen.add(short)

    return ", ".join(titles[:4])


def determine_severity(narrative: str, matched_statutes: List[Dict]) -> str:
    """Determine incident severity based on narrative content and matched provisions."""
    lower = narrative.lower()
    critical_indicators = [
        "murder", "death", "killed", "terrorism", "bomb", "explosive",
        "critical infrastructure", "national security", "child",
        "gang rape", "kidnap", "ransom", "life imprisonment", "crore",
        "nuclear", "defense", "military"
    ]
    high_indicators = [
        "fraud", "hack", "breach", "unauthorized", "stolen", "malware",
        "ransomware", "extortion", "identity theft", "phishing",
        "lakhs", "drone", "surveillance", "espionage"
    ]

    critical_count = sum(1 for ind in critical_indicators if ind in lower)
    high_count = sum(1 for ind in high_indicators if ind in lower)

    # Also consider if top statutes carry severe penalties
    severe_statutes = any(
        "life imprisonment" in s.get("context_template", "").lower() or
        "death" in s.get("context_template", "").lower()
        for s in matched_statutes[:3]
    )

    if critical_count >= 2 or severe_statutes:
        return "CRITICAL"
    elif critical_count >= 1 or high_count >= 2:
        return "HIGH"
    elif high_count >= 1:
        return "ELEVATED"
    else:
        return "MODERATE"


def generate_executive_summary(
    narrative: str,
    classification: str,
    severity: str,
    matched_statutes: List[Dict],
    entities: List[Dict]
) -> str:
    """Generate a contextual executive summary of the incident."""
    victim_entities = [e for e in entities if e["type"] == "VICTIM"]
    artifact_entities = [e for e in entities if e["type"] == "ARTIFACT"]
    suspect_entities = [e for e in entities if e["type"] == "SUSPECT"]

    victim_str = ", ".join(e["label"] for e in victim_entities[:2]) or "an unidentified target"
    top_sections = ", ".join(s["badge"] for s in matched_statutes[:3]) or "pending legal mapping"

    summary = (
        f"EXECUTIVE SUMMARY: This incident has been classified as {classification} "
        f"with a severity level of {severity}. The narrative describes actions targeting "
        f"{victim_str}. Preliminary analysis has identified {len(entities)} forensic entities "
        f"including {len(artifact_entities)} digital artifacts, {len(suspect_entities)} suspect indicators, "
        f"and {len(victim_entities)} victim classifications. "
        f"The top applicable legal provisions are {top_sections}. "
        f"Immediate investigative action is recommended under the mapped legal framework."
    )
    return summary


def generate_immediate_actions(
    severity: str,
    matched_statutes: List[Dict],
    entities: List[Dict]
) -> List[str]:
    """Generate prioritized immediate action items."""
    actions = []

    # Always include FIR registration
    actions.append("Register FIR immediately under applicable sections of BNS 2023 and IT Act 2000.")

    # Evidence preservation
    actions.append("Preserve all digital evidence with SHA-256 hash verification and maintain strict chain of custody.")

    # Financial freeze if financial entities detected
    financial_indicators = any(
        e["sublabel"] in ["Financial Identifier", "Financial Amount"]
        for e in entities
    )
    if financial_indicators:
        actions.append("Issue Sec 106 BNSS freeze orders on all identified bank accounts and UPI wallets within the golden hour.")

    # IP/Network related
    ip_entities = [e for e in entities if "IP" in e["label"] or e["sublabel"] == "Network Indicator"]
    if ip_entities:
        actions.append("Issue Sec 91 BNSS notices to ISPs and VPN providers for subscriber logs, IP allocation records, and session data.")

    # Telecom related
    phone_entities = [e for e in entities if e["sublabel"] == "Telecom Identifier"]
    if phone_entities:
        actions.append("Request CDR/IPDR from telecom operators for all identified phone numbers with cell tower dump data.")

    # Critical severity escalation
    if severity == "CRITICAL":
        actions.append("ESCALATE: Notify CERT-In, NIA, and state cyber cell for coordinated response.")
        actions.append("Activate crisis management protocols and brief senior officers.")

    # Drone specific
    drone_entities = [e for e in entities if "Drone" in e["label"] or "UAV" in e["label"]]
    if drone_entities:
        actions.append("Seize drone equipment, extract flight logs from onboard storage, and verify DGCA Digital Sky registration.")

    # Always end with CERT-In reporting for cyber cases
    if any("IT" in s["section_id"] for s in matched_statutes[:5]):
        actions.append("Report the cyber incident to CERT-In within 6 hours as mandated by the Cyber Security Directions 2022.")

    return actions


def analyze_narrative(narrative: str) -> Dict[str, Any]:
    """
    Main analysis function — the core of the offline legal engine.
    
    Takes a raw complaint narrative and returns a comprehensive
    structured analysis payload.
    """
    if not narrative or not narrative.strip():
        return {
            "classification": "No Input Provided",
            "severity": "N/A",
            "executive_summary": "Please provide a complaint narrative for analysis.",
            "immediate_actions": [],
            "mapped_sections": [],
            "entities": [],
            "total_statutes_scanned": len(STATUTES)
        }

    # Step 1: Extract entities from the narrative
    entities = extract_entities(narrative)

    # Step 2: Score and rank legal statutes
    all_scored = score_statutes(narrative)
    
    # Take top 8 most relevant statutes for display
    top_statutes = all_scored[:8]

    # Step 3: Determine classification and severity
    classification = determine_classification(top_statutes)
    severity = determine_severity(narrative, top_statutes)

    # Step 4: Generate executive summary
    executive_summary = generate_executive_summary(
        narrative, classification, severity, top_statutes, entities
    )

    # Step 5: Generate immediate action items
    immediate_actions = generate_immediate_actions(severity, top_statutes, entities)

    # Step 6: Build the mapped sections payload
    mapped_sections = []
    for statute in top_statutes:
        mapped_sections.append({
            "section_id": statute["section_id"],
            "badge": statute["badge"],
            "title": statute["title"],
            "context": statute.get("context_template", ""),
            "checklist": statute["checklist"],
            "score": statute["score"],
            "matched_keywords": statute.get("matched_keywords", [])
        })

    return {
        "classification": classification,
        "severity": severity,
        "executive_summary": executive_summary,
        "immediate_actions": immediate_actions,
        "mapped_sections": mapped_sections,
        "entities": entities,
        "total_statutes_scanned": len(STATUTES)
    }


# ── CLI Testing ──
if __name__ == "__main__":
    test_narrative = """
    On the night of July 14th, a low-flying drone was intercepted hovering near the 
    high-security server farm at the AlphaTech R&D Complex. Facility guards reported 
    the drone was attempting to intercept local Wi-Fi traffic before crashing into the 
    perimeter fence. The drone has been identified as a heavily modified DJI Matrice 
    300 RTK lacking standard registration numbers. Preliminary analysis of the drone's 
    SD card reveals captured network packets from the facility's internal network, 
    including what appear to be employee credential dumps. The suspect's IP trail leads 
    to 192.168.45.12 routed through a VPN proxy at 103.24.77.200. The estimated damage 
    to the server farm perimeter and potential data breach could exceed Rs. 15,00,000.
    """
    
    result = analyze_narrative(test_narrative)
    print(json.dumps(result, indent=2))

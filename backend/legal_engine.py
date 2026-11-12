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
    # First, capture ranges like "3000rs to 5000rs" or "Rs 3000 - Rs 5000"
    range_pattern = r'(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{1,2})?\s*(?:to|-)\s*(?:Rs\.?|INR|₹)?\s*[\d,]+(?:\.\d{1,2})?|[\d,]+(?:\.\d{1,2})?\s*(?:rs\.?|rupees)\s*(?:to|-)\s*[\d,]+(?:\.\d{1,2})?\s*(?:rs\.?|rupees)'
    ranges = re.findall(range_pattern, narrative, re.IGNORECASE)
    captured_money_spans = set()
    for val in ranges[:3]:
        # Extract all numbers from the range
        nums = re.findall(r'[\d,]+(?:\.\d{1,2})?', val)
        if len(nums) >= 2:
            formatted = f"₹{nums[0].strip()} - ₹{nums[1].strip()}"
            entities.append({
                "type": "ARTIFACT",
                "label": formatted,
                "sublabel": "Financial Amount (Range)",
                "icon": "indian-rupee"
            })
            captured_money_spans.add(val.strip())

    # Then, capture single amounts: prefix style (Rs/₹/INR 40000) and suffix style (40000rs)
    prefix_money = re.findall(r'(?:Rs\.?|INR|₹)\s*[\d,]+(?:\.\d{1,2})?', narrative, re.IGNORECASE)
    suffix_money = re.findall(r'[\d,]+(?:\.\d{1,2})?\s*(?:rs\.?|rupees)', narrative, re.IGNORECASE)
    all_money = prefix_money + suffix_money

    for val in all_money[:5]:
        clean_val = val.strip().rstrip('.,; ')
        # Skip if already captured as part of a range
        if any(clean_val in span for span in captured_money_spans):
            continue
        # Normalize: extract just the number and prefix with ₹
        num = re.search(r'[\d,]+(?:\.\d{1,2})?', clean_val)
        if num:
            formatted = f"₹{num.group(0)}"
            if not any(e["label"] == formatted for e in entities):
                entities.append({
                    "type": "ARTIFACT",
                    "label": formatted,
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
    # Use word-boundary matching to prevent false positives (e.g., "attorney" → "TOR")
    suspect_keywords = {
        r"\bdrone\b": ("Unauthorized Drone / UAV", "Aerial Platform"),
        r"\bdji\b": ("Modified DJI Drone Platform", "Aerial Platform"),
        r"\bmatrice\b": ("Modified DJI Matrice 300 RTK", "Surveillance Drone"),
        r"\bmavic\b": ("DJI Mavic Series Drone", "Consumer Drone"),
        r"\bdark\s*web\b": ("Dark Web Marketplace", "Criminal Platform"),
        r"\btor\s+network\b|\btor\s+browser\b|\busing\s+tor\b": ("TOR Network / Anonymization", "Anonymization Tool"),
        r"\bvpn\s+service\b|\bused\s+(?:a\s+)?vpn\b|\bvia\s+vpn\b": ("VPN Service / Anonymizer", "Anonymization Tool"),
        r"\bburner\s+phone\b": ("Disposable / Burner Phone", "Communication Device"),
        r"\bsim\s+card\b|\bsim\s+swap\b|\bfake\s+sim\b": ("SIM Card / Telecom Identity", "Telecom Asset"),
    }
    for pattern, (label, sublabel) in suspect_keywords.items():
        if re.search(pattern, lower) and not any(e["label"] == label for e in entities):
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





def generate_executive_summary(
    narrative: str,
    classification: str,
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
        f"EXECUTIVE SUMMARY: This incident has been classified as {classification}. "
        f"The narrative describes actions targeting "
        f"{victim_str}. Preliminary analysis has identified {len(entities)} forensic entities "
        f"including {len(artifact_entities)} digital artifacts, {len(suspect_entities)} suspect indicators, "
        f"and {len(victim_entities)} victim classifications. "
        f"The top applicable legal provisions are {top_sections}. "
        f"Immediate investigative action is recommended under the mapped legal framework."
    )
    return summary


def generate_immediate_actions(
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

    # Step 3: Determine classification
    classification = determine_classification(top_statutes)

    # Step 4: Generate executive summary
    executive_summary = generate_executive_summary(
        narrative, classification, top_statutes, entities
    )

    # Step 5: Generate immediate action items
    immediate_actions = generate_immediate_actions(top_statutes, entities)

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
        "executive_summary": executive_summary,
        "immediate_actions": immediate_actions,
        "mapped_sections": mapped_sections,
        "entities": entities,
        "total_statutes_scanned": len(STATUTES)
    }


def chat_response(text: str, case_context: Optional[Dict] = None) -> str:
    """
    Chat mode — returns a single short conversational string.
    Takes the top matched statute and one key checklist action to give
    a crisp, actionable reply for the floating chatbot widget.

    When case_context is provided (officer has selected a case), the
    response is enriched with case-specific information.
    """
    if not text or not text.strip():
        return "Please describe a case scenario or ask a legal question and I'll provide guidance."

    # ── Greeting Interceptor (runs before statute scoring) ──
    clean_text = text.lower().strip().rstrip("!?.")
    greetings = {
        "hi", "hello", "hey", "greetings", "good morning", "good afternoon",
        "good evening", "help", "hii", "hiii", "yo", "howdy", "sup", "namaste"
    }
    if clean_text in greetings:
        if case_context:
            case_title = case_context.get("title", "Untitled")
            case_number = case_context.get("case_number", "N/A")
            return (
                f"Hello, Officer. I am online and ready to assist.\n\n"
                f"**Active Case:** {case_number} — {case_title}\n\n"
                f"Ask me anything about this case — status, applicable legal provisions, "
                f"or recommended next steps."
            )
        return (
            "Hello, Officer. I am online and ready to assist. "
            "Please provide the case details, artifact, or narrative "
            "you would like me to analyze."
        )

    # ── Build enriched query text when case context is available ──
    scoring_text = text
    case_preamble = ""
    if case_context:
        context_parts = []
        if case_context.get("case_number"):
            context_parts.append(f"Case Number: {case_context['case_number']}")
        if case_context.get("title"):
            context_parts.append(f"Title: {case_context['title']}")
        if case_context.get("status"):
            context_parts.append(f"Status: {case_context['status']}")
        if case_context.get("priority"):
            context_parts.append(f"Priority: {case_context['priority']}")
        if case_context.get("assignee"):
            context_parts.append(f"Assigned Officer: {case_context['assignee']}")
        if case_context.get("location"):
            context_parts.append(f"Location: {case_context['location']}")
        if case_context.get("date"):
            context_parts.append(f"Date Filed: {case_context['date']}")
        if case_context.get("description"):
            context_parts.append(f"Narrative: {case_context['description']}")

        case_preamble = " | ".join(context_parts)
        # Prepend case context to the scoring text so statute matching
        # considers the full picture (title often contains crime keywords)
        scoring_text = f"{case_preamble}. {text}"

    scored = score_statutes(scoring_text)

    if not scored:
        if case_context:
            case_number = case_context.get("case_number", "N/A")
            return (
                f"I reviewed the context for **{case_number}** but couldn't match a specific statute "
                f"to your query. Try rephrasing with keywords such as 'hacking', 'fraud', 'drone', "
                f"or 'identity theft' and I'll map the applicable legal provisions."
            )
        # Fallback: general guidance when no statute matched
        return (
            "I couldn't match a specific statute to your query. "
            "Please try rephrasing with keywords such as 'hacking', 'fraud', 'drone', or 'identity theft' "
            "and I'll map the applicable legal provisions."
        )

    top = scored[0]
    badge = top["badge"]
    title = top["title"]
    # Pick the first checklist item as the immediate recommendation
    first_action = top["checklist"][0] if top["checklist"] else "Preserve all evidence immediately."

    if case_context:
        case_number = case_context.get("case_number", "N/A")
        case_status = case_context.get("status", "Unknown").upper()
        return (
            f"**Case {case_number}** (Status: {case_status})\n\n"
            f"Based on the case file and your query, the following applies:\n\n"
            f"**Section:** {badge} — {title}\n\n"
            f"**Immediate Recommendation:**\n"
            f"• {first_action}"
        )

    return (
        f"Based on your query, the following applies:\n\n"
        f"**Section:** {badge} — {title}\n\n"
        f"**Immediate Recommendation:**\n"
        f"• {first_action}"
    )


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

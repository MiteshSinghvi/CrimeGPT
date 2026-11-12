import logging
import os
import ollama
from app.models import FIRAnalysis, ExtractedEntity

logger = logging.getLogger(__name__)
OLLAMA_LLM_MODEL = os.getenv("OLLAMA_LLM_MODEL", "llama3")

SYSTEM_PROMPT = """You are an expert police investigator and digital forensics specialist analyzing Indian cybercrime FIR (First Information Report) narratives.
Your task is to carefully review the provided complaint text and extract structured information, including a summary, crime classification, extracted entities, and recommended immediate action steps.

STRICT IOC EXTRACTION RULES:
You MUST extract all specific technical identifiers (Indicators of Compromise) from the text. This includes:
- Phone Numbers (with country codes, e.g., "+91-9876543210")
- Telegram/Social Media handles (e.g., "@handle")
- UPI IDs / VPA (e.g., "merchant@okaxis")
- Bank Account Numbers and IFSC codes
- Full URLs and domains
- Email addresses, IP addresses
Classify these as 'ARTIFACT' or 'SUSPECT_IDENTIFIER'.

FINANCIAL AMOUNT RULES:
- Consolidate Currencies: Never extract standalone currency abbreviations (e.g., "rs", "rupees", "INR", "$") as independent entities. Always combine them with their numerical value (e.g., "₹40,000").
- Handle Ranges: If a financial amount is a range (e.g., "3000rs to 5000rs"), extract it as a SINGLE entity formatted as "₹3,000 - ₹5,000". Do NOT split it into two entities.

ZERO HALLUCINATION POLICY:
DO NOT infer, guess, or hallucinate entities, tools, or suspects. If a tool like 'TOR' or 'VPN' is NOT explicitly written in the text, do NOT extract it. Only extract exact names, entities, and amounts literally present in the raw narrative.

FORMATTING RULES:
- Strip trailing commas, periods, or spaces from extracted entity names.
- Only extract highly relevant artifacts. Ignore conversational filler.

Always return your analysis in the exact JSON format requested."""

def analyze_complaint_narrative(complaint_text: str) -> FIRAnalysis:
    try:
        response = ollama.chat(
            model=OLLAMA_LLM_MODEL,
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': complaint_text}
            ],
            format=FIRAnalysis.model_json_schema(),
            options={'temperature': 0}
        )
        
        # Parse the JSON response into our Pydantic model
        content = response['message']['content']
        return FIRAnalysis.model_validate_json(content)
        
    except Exception as e:
        logger.error(f"Error during Ollama analysis: {e}. Returning mock fallback response.")
        # Fallback mock response for live demo drop
        return FIRAnalysis(
            summary="[MOCK FALLBACK] The complaint describes a potential cybercrime incident.",
            crime_classification="Unknown Cybercrime",
            severity_assessment="Medium Severity",
            extracted_entities=[
                ExtractedEntity(
                    name="Unknown Identifier",
                    role="Unknown",
                    entity_type="Person"
                )
            ],
            recommended_immediate_action="Investigate further and verify the details of the complaint. (Mock data returned due to AI server unavailability)"
        )

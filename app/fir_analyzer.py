import logging
import ollama
from app.models import FIRAnalysis, ExtractedEntity

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert police investigator specializing in analyzing Indian cybercrime FIR (First Information Report) narratives.
Your task is to carefully review the provided complaint text and extract structured information, including a summary, crime classification, severity assessment, extracted entities (such as victims, suspects, platforms, etc.), and recommend immediate action steps.
Always return your analysis in the exact JSON format requested."""

def analyze_complaint_narrative(complaint_text: str) -> FIRAnalysis:
    try:
        response = ollama.chat(
            model='llama3',
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

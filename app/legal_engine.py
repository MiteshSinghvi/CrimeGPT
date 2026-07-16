import logging
import ollama
import chromadb
from app.models import LegalIntelligenceReport, LegalRecommendation

logger = logging.getLogger(__name__)

# Initialize ChromaDB client pointing to ./local_legal_db
chroma_client = chromadb.PersistentClient(path="./local_legal_db")

# Get or create collection
collection = chroma_client.get_or_create_collection(name="bns_bnss_bsa_laws")

SYSTEM_PROMPT = """You are an expert legal advisor assisting law enforcement. 
Your task is to map the provided crime details to the relevant legal statutes based ONLY on the provided context retrieved from our legal database. 
DO NOT hallucinate or invent laws. Use ONLY the retrieved statutes to formulate your recommendations.
Always return your analysis in the exact JSON format requested."""

def get_legal_intelligence(crime_summary: str, crime_classification: str) -> LegalIntelligenceReport:
    query_text = f"{crime_classification}: {crime_summary}"
    
    try:
        # Query ChromaDB for top 3 matching paragraphs
        results = collection.query(
            query_texts=[query_text],
            n_results=3
        )
        
        # Combine retrieved paragraphs into context string
        context_snippets = results.get("documents", [[]])[0]
        context_text = "\n\n".join(context_snippets) if context_snippets else "No relevant legal statutes found."
        
        # Construct strict prompt
        user_prompt = f"""Crime Classification: {crime_classification}
Crime Summary: {crime_summary}

Retrieved Legal Statutes (Context):
{context_text}

Based ONLY on the retrieved legal statutes above, please provide the recommended legal provisions, required evidence, and an investigation checklist."""

        # Call Ollama
        response = ollama.chat(
            model='llama3',
            messages=[
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': user_prompt}
            ],
            format=LegalIntelligenceReport.model_json_schema(),
            options={'temperature': 0.1}
        )
        
        # Parse and validate response
        content = response['message']['content']
        return LegalIntelligenceReport.model_validate_json(content)
        
    except Exception as e:
        logger.error(f"Error during legal intelligence generation: {e}")
        # Fallback response for live demo
        return LegalIntelligenceReport(
            recommended_provisions=[
                LegalRecommendation(
                    act="BNS 2023",
                    section_number="Unknown",
                    offence_title="Unknown Offence",
                    why_it_applies=f"Error occurred during DB or AI execution: {e}",
                    required_evidence=[],
                    investigation_checklist=["Verify local legal DB has been populated", "Check Ollama server"]
                )
            ]
        )

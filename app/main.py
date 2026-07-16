import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

from app.models import FIRAnalysis, LegalIntelligenceReport
from app.fir_analyzer import analyze_complaint_narrative
from app.legal_engine import get_legal_intelligence, chroma_client

logger = logging.getLogger(__name__)

app = FastAPI(title="CrimeGPT Local AI Copilot")

# Enable CORS for all origins for local React frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CaseInput(BaseModel):
    complaint_text: str

class FullAICopilotResponse(BaseModel):
    analysis: FIRAnalysis
    legal_intelligence: LegalIntelligenceReport

@app.post("/api/v1/analyze-case", response_model=FullAICopilotResponse)
async def analyze_case(payload: CaseInput):
    logger.info("Step 1: Executing FIR analysis...")
    # Step 1: Execute FIR analysis
    analysis = analyze_complaint_narrative(payload.complaint_text)
    
    logger.info(f"Step 2: Retrieving legal intelligence for: {analysis.crime_classification}")
    # Step 2: Pass resulting summary and classification to legal engine
    legal_intelligence = get_legal_intelligence(
        crime_summary=analysis.summary,
        crime_classification=analysis.crime_classification
    )
    
    # Step 3: Return combined payload
    return FullAICopilotResponse(
        analysis=analysis,
        legal_intelligence=legal_intelligence
    )

@app.get("/health")
async def health_check():
    ollama_status = "ok"
    try:
        ollama.list()
    except Exception as e:
        ollama_status = f"error: {str(e)}"
        
    chroma_status = "ok"
    try:
        chroma_client.heartbeat()
    except Exception as e:
        chroma_status = f"error: {str(e)}"
        
    return {
        "status": "ok",
        "ollama_status": ollama_status,
        "chromadb_status": chroma_status
    }

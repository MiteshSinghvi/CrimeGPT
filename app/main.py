import logging
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import ollama
import chromadb
from app.models import FIRAnalysis, LegalIntelligenceReport
from app.legal_engine import get_legal_context

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Pure-Ollama environment...")
    logger.info("Reminder: Ensure Ollama is updated for memory scheduling and 'nomic-embed-text' is pulled.")
    logger.info("Initializing ChromaDB client...")
    app.state.chroma_client = chromadb.PersistentClient(path="./local_legal_db")
    app.state.collection = app.state.chroma_client.get_or_create_collection(
        name="indian_legal_statutes"
    )
    logger.info("ChromaDB client initialized successfully.")
    yield

app = FastAPI(title="CrimeGPT Local AI Copilot", lifespan=lifespan)

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

@app.post("/api/v1/analyze-case")
async def analyze_case(payload: CaseInput, request: Request):
    logger.info("Step 1: Offline Search - Retrieving local legal statutes...")
    
    # 1. Offline RAG: Instantly vectorize and query local ChromaDB
    collection = request.app.state.collection
    context_text = get_legal_context(payload.complaint_text, collection)
    
    logger.info("Step 2 & 3: Prompt Injection and Local LLM Streaming...")
    
    SYSTEM_PROMPT = """You are an expert police investigator and legal advisor analyzing Indian FIR narratives.
Your task is to carefully review the complaint, extract structured information, and map it to the relevant legal statutes based ONLY on the retrieved context.
Always return your analysis in the exact JSON format requested."""

    user_prompt = f"""Complaint Narrative: {payload.complaint_text}

[MANDATORY APPLICABLE BNS 2023 & IT ACT PROVISIONS]
{context_text}
[/MANDATORY APPLICABLE BNS 2023 & IT ACT PROVISIONS]

Based on the narrative and the mandatory laws provided, generate a unified JSON response matching the required schema. Ensure the response contains BOTH the FIR analysis and the legal intelligence.
"""

    def generate_sse():
        try:
            response = ollama.chat(
                model='llama3',
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': user_prompt}
                ],
                format=FullAICopilotResponse.model_json_schema(),
                options={'temperature': 0.1},
                stream=True
            )
            for chunk in response:
                content = chunk.get('message', {}).get('content', '')
                if content:
                    yield f"data: {json.dumps({'text': content})}\n\n"
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(generate_sse(), media_type="text/event-stream")

@app.get("/health")
async def health_check():
    ollama_status = "ok"
    try:
        ollama.list()
    except Exception as e:
        ollama_status = f"error: {str(e)}"
        
    return {
        "status": "ok",
        "ollama_status": ollama_status
    }

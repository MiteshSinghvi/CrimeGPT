import logging
import json
import os
import secrets
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Header, HTTPException, Depends

load_dotenv()

OLLAMA_LLM_MODEL = os.getenv("OLLAMA_LLM_MODEL", "llama3")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./local_legal_db")
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import ollama
import chromadb
from app.models import FIRAnalysis, LegalIntelligenceReport
from app.legal_engine import get_legal_context
from backend.legal_engine import chat_response

logger = logging.getLogger(__name__)

# ── Security: Internal API secret (SEC-04) ────────────────────────────────────
# Set BACKEND_API_SECRET in your server-side .env (never a VITE_ variable)
BACKEND_API_SECRET = os.getenv("BACKEND_API_SECRET", "")

async def verify_internal_token(x_api_key: str = Header(default="")):
    """
    Rejects any request that does not carry the correct internal API secret.
    Uses constant-time comparison to prevent timing attacks.
    """
    if not BACKEND_API_SECRET:
        # If no secret is set (dev mode), log a warning but allow through
        logger.warning("BACKEND_API_SECRET is not set — running without endpoint auth (dev only).")
        return
    if not secrets.compare_digest(x_api_key, BACKEND_API_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid API key.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Pure-Ollama environment...")
    logger.info("Reminder: Ensure Ollama is updated for memory scheduling and 'nomic-embed-text' is pulled.")
    logger.info("Initializing ChromaDB client...")
    app.state.chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
    app.state.collection = app.state.chroma_client.get_or_create_collection(
        name="indian_legal_statutes"
    )
    logger.info("ChromaDB client initialized successfully.")
    yield

app = FastAPI(title="CrimeGPT Local AI Copilot", lifespan=lifespan)

# ── Security: Strict CORS (SEC-03) ────────────────────────────────────────────
# Reads from env — default is localhost only. Never use ["*"] in production.
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,           # SEC-03: restricted to frontend origin
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Api-Key"],
)


# ── Input Models with Validation (SEC-10) ─────────────────────────────────────

class CaseInput(BaseModel):
    complaint_text: str = Field(
        ...,
        min_length=10,
        max_length=10000,
        description="Complaint narrative text (10–10,000 characters)"
    )

class FullAICopilotResponse(BaseModel):
    analysis: FIRAnalysis
    legal_intelligence: LegalIntelligenceReport

class ChatInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    mode: str = Field(default="chat", pattern="^(chat|analysis)$")
    case_context: dict = Field(default=None, description="Optional selected case data for context-aware responses")
    chat_history: list = Field(default=[], description="Previous conversation messages for multi-turn context")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/api/v1/analyze-case", dependencies=[Depends(verify_internal_token)])
async def analyze_case(payload: CaseInput, request: Request):
    logger.info("Step 1: Offline Search - Retrieving local legal statutes...")
    
    # 1. Offline RAG: Instantly vectorize and query local ChromaDB
    collection = request.app.state.collection
    context_text = get_legal_context(payload.complaint_text, collection)
    
    logger.info("Step 2 & 3: Prompt Injection and Local LLM Streaming...")
    
    SYSTEM_PROMPT = """You are an expert police investigator, legal advisor, and digital forensics specialist analyzing Indian FIR narratives.
Your task is to carefully review the complaint, extract structured information, and map it to the relevant legal statutes based ONLY on the retrieved context.

STRICT IOC EXTRACTION RULES:
You MUST extract all specific technical identifiers (Indicators of Compromise) from the text. This includes:
- Phone Numbers (with country codes, e.g., "+91-9876543210")
- Telegram/Social Media handles (e.g., "@handle")
- UPI IDs / VPA (e.g., "merchant@okaxis")
- Bank Account Numbers and IFSC codes
- Full URLs and domains
- Email addresses
- IP addresses
Classify these as 'ARTIFACT' or 'SUSPECT_IDENTIFIER'.

FINANCIAL AMOUNT RULES:
- Consolidate Currencies: Never extract standalone currency abbreviations (e.g., "rs", "rupees", "INR", "$") as independent entities. Always combine them with their numerical value (e.g., "₹40,000").
- Handle Ranges: If a financial amount is a range (e.g., "3000rs to 5000rs"), extract it as a SINGLE entity formatted as "₹3,000 - ₹5,000". Do NOT split it into two entities.
- Prioritize extracting the total defrauded amount.

ZERO HALLUCINATION POLICY:
DO NOT infer, guess, or hallucinate entities, tools, or suspects. If a tool like 'TOR' or 'VPN' is NOT explicitly written in the text, do NOT extract it. Only extract exact names, entities, and amounts literally present in the raw narrative.

FORMATTING RULES:
- Strip trailing commas, periods, or spaces from extracted entity names.
- Only extract highly relevant artifacts. Ignore conversational filler.

Always return your analysis in the exact JSON format requested, ensuring the entities are a clean JSON array of objects. For example:
[
  { "type": "Phone Number", "value": "+91-9876543210", "category": "SUSPECT" },
  { "type": "UPI Handle", "value": "merchant-pay@okaxis", "category": "ARTIFACT" },
  { "type": "Financial Amount", "value": "₹3,000 - ₹5,000", "category": "ARTIFACT" }
]"""

    user_prompt = f"""Complaint Narrative: {payload.complaint_text}

[MANDATORY APPLICABLE BNS 2023 & IT ACT PROVISIONS]
{context_text}
[/MANDATORY APPLICABLE BNS 2023 & IT ACT PROVISIONS]

Based on the narrative and the mandatory laws provided, generate a unified JSON response matching the required schema. Ensure the response contains BOTH the FIR analysis and the legal intelligence.
"""

    def generate_sse():
        try:
            response = ollama.chat(
                model=OLLAMA_LLM_MODEL,
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


@app.post("/api/v1/chat", dependencies=[Depends(verify_internal_token)])
async def chat(payload: ChatInput):
    """
    Conversational chat endpoint for the floating chatbot widget.
    Routes through Ollama LLM for dynamic, context-aware responses.
    Falls back to the offline keyword engine if Ollama is unavailable.
    """

    # ── Build the system prompt ──
    if payload.case_context:
        ctx = payload.case_context
        case_fields = []
        if ctx.get("case_number"):
            case_fields.append(f"Case Number: {ctx['case_number']}")
        if ctx.get("title"):
            case_fields.append(f"Title: {ctx['title']}")
        if ctx.get("status"):
            case_fields.append(f"Status: {ctx['status']}")
        if ctx.get("priority"):
            case_fields.append(f"Priority: {ctx['priority']}")
        if ctx.get("assignee"):
            case_fields.append(f"Assigned Officer: {ctx['assignee']}")
        if ctx.get("location"):
            case_fields.append(f"Location: {ctx['location']}")
        if ctx.get("date"):
            case_fields.append(f"Date Filed: {ctx['date']}")
        if ctx.get("description"):
            case_fields.append(f"Case Narrative: {ctx['description']}")

        case_block = "\n".join(case_fields)
        system_prompt = f"""You are an expert AI forensic assistant for the ACCB (Anti-Cybercrime Branch) operating within CrimeGPT.
You are assisting a police officer with a specific active case file. Here is the case data:

{case_block}

CRITICAL INSTRUCTIONS:
1. You MUST directly answer the officer's specific question. If they ask for a summary, give a summary. If they ask about status, give the status. Do NOT use a rigid template for every response.
2. If the officer asks for information not present in the case data above, explicitly state: "That information is not available in the current case file."
3. When referencing legal provisions, cite specific BNS 2023, BNSS 2023, or IT Act 2000 sections where applicable.
4. Maintain a professional, concise, and analytical tone befitting a law enforcement AI assistant.
5. Keep responses focused and under 200 words unless more detail is specifically requested."""
    else:
        system_prompt = """You are a helpful AI assistant for CrimeGPT, an advanced police investigation dashboard used by the Anti-Cybercrime Branch (ACCB).
You can help officers with:
- Understanding Indian cyber crime laws (BNS 2023, BNSS 2023, IT Act 2000)
- Guidance on investigation procedures and evidence handling
- General platform navigation and feature explanations

INSTRUCTIONS:
1. Answer the officer's question directly and conversationally.
2. Keep responses concise and professional (under 150 words unless more detail is needed).
3. If the officer hasn't selected a case, remind them they can select one from the dropdown for case-specific analysis."""

    # ── Build the messages array for the LLM ──
    ollama_messages = [{'role': 'system', 'content': system_prompt}]

    # Append conversation history (limit to last 10 exchanges to keep context manageable)
    for msg in (payload.chat_history or [])[-20:]:
        role = msg.get("role", "user")
        content = msg.get("text", "") or msg.get("content", "")
        if role in ("user", "assistant") and content:
            ollama_messages.append({'role': role, 'content': content})

    # Append the current user message
    ollama_messages.append({'role': 'user', 'content': payload.text})

    # ── Try Ollama LLM first, fall back to keyword engine ──
    def generate_chat_stream():
        try:
            response = ollama.chat(
                model=OLLAMA_LLM_MODEL,
                messages=ollama_messages,
                options={'temperature': 0.7, 'num_predict': 300},
                stream=True
            )
            for chunk in response:
                content = chunk.get('message', {}).get('content', '')
                if content:
                    yield f"data: {json.dumps({'text': content})}\n\n"
        except Exception as e:
            logger.warning(f"Ollama chat streaming failed, falling back to keyword engine: {e}")
            # Graceful fallback to the offline keyword scoring engine
            reply = chat_response(payload.text, case_context=payload.case_context)
            yield f"data: {json.dumps({'text': reply})}\n\n"
            
    return StreamingResponse(generate_chat_stream(), media_type="text/event-stream")


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


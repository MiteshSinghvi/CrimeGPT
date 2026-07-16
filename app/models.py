from typing import List, Literal
from pydantic import BaseModel

class ExtractedEntity(BaseModel):
    name: str
    role: Literal["Suspect", "Victim", "Witness", "Unknown"]
    entity_type: Literal["Person", "Platform", "Location", "Date"]

class FIRAnalysis(BaseModel):
    summary: str
    crime_classification: str
    severity_assessment: Literal["Low Severity", "Medium Severity", "High Severity", "Critical Severity"]
    extracted_entities: List[ExtractedEntity]
    recommended_immediate_action: str

class LegalRecommendation(BaseModel):
    act: str
    section_number: str
    offence_title: str
    why_it_applies: str
    required_evidence: List[str]
    investigation_checklist: List[str]

class LegalIntelligenceReport(BaseModel):
    recommended_provisions: List[LegalRecommendation]

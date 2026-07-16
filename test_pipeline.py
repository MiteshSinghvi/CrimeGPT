import json
from pprint import pprint
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

payload = {
    "complaint_text": "Victim Riya Shah reports online harassment and identity theft. On 14th July 2026, an unknown suspect created a fake Instagram profile using her stolen photographs and personal details. The suspect is sending threatening messages via WhatsApp demanding Rs 50,000 via UPI to delete the profile and threatening to defame her online if she does not pay."
}

def main():
    print("Executing test pipeline...")
    response = client.post("/api/v1/analyze-case", json=payload)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}. Response: {response.text}"
    
    data = response.json()
    
    print("\n--- Full AI Copilot JSON Response ---")
    pprint(data, indent=2)
    print("-" * 50)
    
    print("\n--- Summary ---")
    analysis = data.get("analysis", {})
    legal = data.get("legal_intelligence", {})
    
    classification = analysis.get("crime_classification", "N/A")
    severity = analysis.get("severity_assessment", "N/A")
    provisions = legal.get("recommended_provisions", [])
    
    print(f"Extracted Crime Classification: {classification}")
    print(f"Calculated Severity Assessment: {severity}")
    print("Recommended Section Numbers:")
    for prov in provisions:
        print(f" - {prov.get('act', 'Unknown Act')}: Section {prov.get('section_number', 'Unknown Section')} ({prov.get('offence_title', 'Unknown Title')})")

if __name__ == "__main__":
    main()

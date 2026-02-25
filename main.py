from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pyswip import Prolog

app = FastAPI()

# Add CORS middleware to allow requests from a React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific domains in production (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Prolog engine and consult the knowledge base
prolog = Prolog()
# We use the doctor_droid.pl file we created earlier
prolog.consult("doctor_droid.pl")

# Define the expected JSON body for the POST request
class ConsultationRequest(BaseModel):
    symptoms: List[str]
    allergies: Optional[List[str]] = []

@app.post("/consult")
async def consult_patient(request: ConsultationRequest):
    """
    Accepts a list of symptoms and allergies, asserts them into the Prolog engine,
    and returns matching diagnoses and any safety warnings.
    """
    # 1. Clear previous patient data to ensure a fresh consultation
    list(prolog.query("clear_patient_data"))
    
    # 2. Assert the new symptoms as facts
    for symptom in request.symptoms:
        # Using the add_symptom helper we defined in the Prolog file
        list(prolog.query(f"assertz(has_symptom({symptom}))"))
        
    # 3. Assert patient info (like allergies) as facts
    if request.allergies:
        for allergy in request.allergies:
            list(prolog.query(f"assertz(patient_info(allergy, {allergy}))"))
            
    # 4. Query the inference engine for diagnoses
    # We query our diagnose(Disease, Treatment) rule
    diagnoses_results = list(prolog.query("diagnose(Disease, Treatment)"))
    
    # Deduplicate and format diagnoses
    diagnoses = []
    seen = set()
    for res in diagnoses_results:
        disease = res.get("Disease")
        if disease not in seen:
            seen.add(disease)
            
            # Fetch the explanation for this diagnosis
            explanations = list(prolog.query(f"explain_diagnosis({disease}, Reason)"))
            reason = explanations[0].get("Reason") if explanations else ""
            
            diagnoses.append({
                "disease": disease,
                "treatment": res.get("Treatment"),
                "explanation": reason
            })
            
    # 5. Query for any safety alerts triggered by the diagnosis and allergies
    alerts_results = list(prolog.query("safety_alert(Warning)"))
    warnings = list(set([res.get("Warning") for res in alerts_results]))
    
    return {
        "status": "success",
        "patient_data": {
            "symptoms": request.symptoms,
            "allergies": request.allergies
        },
        "diagnoses": diagnoses,
        "warnings": warnings
    }

# Provide a simple root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Doctor Droid API. Use POST /consult to evaluate patients."}

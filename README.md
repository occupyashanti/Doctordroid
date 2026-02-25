# Doctor Droid - Medical Expert System

An automated diagnostic expert system built using a pure SWI-Prolog knowledge base, connected via an API bridge to a modern React frontend wizard.

![Diagnostic Results](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/images/components/card.png) *(Note: To view actual system screenshots, refer to the local testing artifacts)*

## Architecture

Doctor Droid is built on a 3-tier architecture:

1. **Inference Engine (SWI-Prolog)**: `doctor_droid.pl`
    * Provides the core medical knowledge base using facts (`disease/3`) and dynamic predicates for patient memory (`has_symptom/1`, `patient_info/2`).
    * Uses backward chaining rules (`diagnose/2`) to derive medical conditions from asserted evidence.
    * Implements critical safety boundaries (`safety_alert/1`) to check for medicinal contraindications (e.g., prescribing Amoxicillin to a patient with a Penicillin allergy).

2. **Backend Bridge (Python / FastAPI + PySWIP)**: `main.py`
    * A FastAPI server that acts as a RESTful conduit.
    * Uses the `pyswip` library to run the Prolog instance in the background.
    * Accepts JSON payloads, parses symptoms/allergies, dynamically asserts them into the Prolog runtime, processes the `evaluate_patient` responses, and returns structured JSON formats to the client over HTTP.

3. **Frontend GUI (React / Vite + TailwindCSS)**: `doctor-droid-ui/`
    * A clean, functional wizard UI built using React and Lucide icons.
    * Users select observed symptoms and known allergies.
    * The frontend submits the data to the FastAPI bridge and graphically renders the returned diagnosis rationale and critical safety red-flag banners.

## Prerequisites

To run this system locally, you need the following installed:

- **SWI-Prolog**: The backend inference engine depends on the native system SWI-Prolog bins.
    * Debian/Ubuntu (Kali): `sudo apt update && sudo apt install swi-prolog`
    * MacOS: `brew install swi-prolog`
- **Node.js & npm**: For running the React UI.
- **Python 3.10+**: For the FastAPI bridge.

## Installation & Setup

### 1. Backend Setup

The recommended approach is running the FastAPI bridge within a Python virtual environment.

```bash
cd Doctor

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install the Python dependencies
pip install fastapi uvicorn pyswip pydantic

# Start the FastAPI server (runs on port 8000 by default)
uvicorn main:app --reload
```

*Note: The FastAPI console must be kept running in the background.*

### 2. Frontend Setup

In a **separate terminal window**, start the React UI.

```bash
cd Doctor/doctor-droid-ui

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will now be accessible at [http://localhost:5173/](http://localhost:5173/).

## Usage

1. Open the UI at `http://localhost:5173/` in your web browser.
2. Select one or more **Observed Symptoms** from the checkbox grid (e.g., *Fever, Cough, Shortness of Breath*).
3. (Optional) Select any **Known Allergies** (e.g., *Penicillin*).
4. Click **Run Diagnostics**.
5. The Inference Engine will evaluate the data.
    - If a match is found, it will display a green card with the disease name, rationale, and recommended medicine.
    - If a toxic medical combination is detected (like an allergenic drug), a red "Critical Safety Alerts" banner will appear at the top preventing standard prescription.

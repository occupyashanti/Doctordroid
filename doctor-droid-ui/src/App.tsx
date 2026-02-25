import { useState } from 'react';
import { Stethoscope, AlertTriangle, CheckCircle2, Loader2, Pill, Activity } from 'lucide-react';

// Types for our API responses
interface Diagnosis {
  disease: string;
  treatment: string;
  explanation: string;
}

interface ApiResponse {
  status: string;
  diagnoses: Diagnosis[];
  warnings: string[];
}

// Full listed symptoms in the Prolog knowledge base
const AVAILABLE_SYMPTOMS = [
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Cough' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath' },
  { id: 'chills', label: 'Chills' },
  { id: 'sweating', label: 'Sweating' },
  { id: 'headache', label: 'Headache' },
  { id: 'abdominal_pain', label: 'Abdominal Pain' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'chest_pain', label: 'Chest Pain' },
  { id: 'blurred_vision', label: 'Blurred Vision' },
  { id: 'runny_nose', label: 'Runny Nose' },
  { id: 'sore_throat', label: 'Sore Throat' },
  { id: 'wheezing', label: 'Wheezing' },
  { id: 'chest_tightness', label: 'Chest Tightness' },
  { id: 'watery_diarrhea', label: 'Watery Diarrhea' },
  { id: 'vomiting', label: 'Vomiting' },
  { id: 'dehydration', label: 'Dehydration' },
  { id: 'chronic_cough', label: 'Chronic Cough' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'night_sweats', label: 'Night Sweats' },
  { id: 'severe_headache', label: 'Severe Headache' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'sensitivity_to_light', label: 'Sensitivity to Light' },
  { id: 'increased_thirst', label: 'Increased Thirst' },
  { id: 'frequent_urination', label: 'Frequent Urination' },
];

const COMMON_ALLERGIES = [
  { id: 'penicillin', label: 'Penicillin' },
  { id: 'sulfa', label: 'Sulfa Drugs' },
  { id: 'nsaids', label: 'NSAIDs (Ibuprofen)' },
];

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const toggleAllergy = (allergyId: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergyId) 
        ? prev.filter(a => a !== allergyId)
        : [...prev, allergyId]
    );
  };

  const handleConsult = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom for consultation.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          allergies: selectedAllergies
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Failed to connect to the Doctor Droid API. Ensure the FastAPI backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-3">
          <Stethoscope className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Doctor Droid</h1>
            <p className="text-blue-100 text-sm">Automated Expert Diagnostic System</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        
        {/* Left Column: Input Form */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Clinical Presentation</h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Symptoms Selection */}
            <div>
              <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                Select Observed Symptoms
                <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {selectedSymptoms.length} selected
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {AVAILABLE_SYMPTOMS.map((symptom) => (
                  <label 
                    key={symptom.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedSymptoms.includes(symptom.id) 
                        ? 'bg-blue-50 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)]' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
                        checked={selectedSymptoms.includes(symptom.id)}
                        onChange={() => toggleSymptom(symptom.id)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700 select-none">
                        {symptom.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies Selection */}
            <div>
              <h3 className="font-medium text-slate-800 mb-3">Known Allergies</h3>
              <div className="flex flex-wrap gap-3">
                {COMMON_ALLERGIES.map((allergy) => (
                  <label 
                    key={allergy.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                      selectedAllergies.includes(allergy.id)
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedAllergies.includes(allergy.id)}
                      onChange={() => toggleAllergy(allergy.id)}
                    />
                    <span className="text-sm font-medium select-none">{allergy.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConsult}
              disabled={isLoading || selectedSymptoms.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consulting Knowledge Base...
                </>
              ) : (
                'Run Diagnostics'
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Results */}
        <section className="flex flex-col gap-6">
          {/* Default State */}
          {!result && !isLoading && (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[400px]">
              <Activity className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">Awaiting Clinical Data</p>
              <p className="text-sm mt-2 max-w-sm">
                Select patient symptoms and known allergies on the left, then run diagnostics to consult the expert system engine.
              </p>
            </div>
          )}

          {/* Results State */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Safety Alerts Banner */}
              {result.warnings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-red-600 px-4 py-3 flex items-center gap-2 text-white">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-semibold">Critical Safety Alerts</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx} className="flex gap-3 text-red-800 text-sm font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          {warning === 'alert_penicillin' 
                            ? 'Patient has a reported Penicillin allergy. Suggested treatment (Amoxicillin) is strictly contraindicated.'
                            : warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Diagnoses Cards */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Diagnostic Results</h2>
                </div>
                
                <div className="p-6">
                  {result.diagnoses.length > 0 ? (
                    <div className="space-y-6">
                      {result.diagnoses.map((dx, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-5 border border-slate-100">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
                            <h3 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
                              {dx.disease.replace(/_/g, ' ')}
                            </h3>
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                              Match Found
                            </span>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Inference Rationale</p>
                              <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200 italic">
                                "{dx.explanation}"
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-slate-500 mb-1">Recommended Treatment Protocol</p>
                              <div className="flex items-center gap-2 text-blue-700 font-semibold bg-blue-50 p-3 rounded border border-blue-100 capitalize">
                                <Pill className="w-4 h-4" />
                                {dx.treatment.replace(/_/g, ' ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-600 font-medium">No matching diagnosis found.</p>
                      <p className="text-sm text-slate-500 mt-1">The provided symptoms do not perfectly match any specific disease protocol in the current knowledge base.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;

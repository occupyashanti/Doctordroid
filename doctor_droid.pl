% Doctor Droid - Medical Expert System Knowledge Base

% --- DYNAMIC PREDICATES ---
% These will be cleared and refilled for every new patient consultation
:- dynamic has_symptom/1.
:- dynamic patient_info/2.

% ==============================================================================
% KNOWLEDGE BASE: DISEASE DEFINITIONS
% ==============================================================================
% Format: disease(Name, ListOfSymptoms, Treatment)

disease(pneumonia, [fever, cough, shortness_of_breath], amoxicillin).
disease(malaria, [fever, chills, sweating, headache], artemisinin).
disease(typhoid, [fever, abdominal_pain, headache, fatigue], ciprofloxacin).
disease(hypertension, [headache, chest_pain, blurred_vision], ace_inhibitors).
disease(common_cold, [cough, runny_nose, sore_throat], rest_and_fluids).
disease(asthma, [wheezing, shortness_of_breath, chest_tightness], albuterol).
disease(cholera, [watery_diarrhea, vomiting, dehydration], oral_rehydration).
disease(tuberculosis, [chronic_cough, fever, weight_loss, night_sweats], isoniazid).
disease(migraine, [severe_headache, nausea, sensitivity_to_light], sumatriptan).
disease(diabetes_type_2, [increased_thirst, frequent_urination, fatigue, blurred_vision], metformin).

% ==============================================================================
% INFERENCE ENGINE: DYNAMIC DIAGNOSIS
% ==============================================================================

% The engine looks for a disease where ALL required symptoms are present in the patient
diagnose(Disease, Treatment) :-
    disease(Disease, RequiredSymptoms, Treatment),
    check_all_symptoms(RequiredSymptoms).

% Recursive helper to check if every symptom in the list is currently asserted as a fact
check_all_symptoms([]).
check_all_symptoms([S|Rest]) :-
    has_symptom(S),
    check_all_symptoms(Rest).

% ==============================================================================
% SAFETY & EXPLANATION
% ==============================================================================

% Safety Rule
safety_alert(alert_penicillin) :-
    diagnose(Disease, amoxicillin),
    patient_info(allergy, penicillin).

% Explanation Facility
explain_diagnosis(Disease, Reason) :-
    disease(Disease, Symptoms, _),
    atomic_list_concat(Symptoms, ', ', SymptomList),
    atomic_list_concat(['Diagnosis of ', Disease, ' reached because patient has: ', SymptomList], Reason).

% ==============================================================================
% UTILITIES FOR GUI INTEGRATION
% ==============================================================================

% Clears the current patient data to prepare for a new consultation
clear_patient_data :-
    retractall(has_symptom(_)),
    retractall(patient_info(_, _)).

% Helper to add a symptom (to be called by GUI)
add_symptom(Symptom) :-
    \+ has_symptom(Symptom),
    assertz(has_symptom(Symptom)).

% Helper to add patient info, like allergies (to be called by GUI)
add_patient_info(Type, Value) :-
    \+ patient_info(Type, Value),
    assertz(patient_info(Type, Value)).

% Conduct a full patient evaluation and return results
evaluate_patient(Disease, Treatment, Explanation, SafetyWarning) :-
    diagnose(Disease, Treatment),
    explain_diagnosis(Disease, Explanation),
    (   safety_alert(alert_penicillin)
    ->  SafetyWarning = 'WARNING: Patient is allergic to penicillin. Do not prescribe Amoxicillin.'
    ;   SafetyWarning = 'Safe to proceed with prescribed treatment.'
    ).

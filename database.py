# Database of clinical cases, NCLEX questions, and reference values

NCLEX_QUESTIONS = [
    # 1. Pharmacological and Parenteral Therapies
    {
        "id": 1,
        "category": "Pharmacological and Parenteral Therapies",
        "question": "A client is prescribed intravenous heparin sodium for a deep vein thrombosis. The nurse monitors the activated partial thromboplastin time (aPTT) and notes it is 120 seconds. What is the priority nursing action?",
        "options": [
            "Withhold the heparin infusion and notify the healthcare provider.",
            "Increase the heparin infusion rate to reach therapeutic range.",
            "Administer Protamine Sulfate immediately.",
            "Draw another blood sample to verify the result."
        ],
        "correctIndex": 0,
        "rationale": "Correct Answer: Withhold the heparin infusion and notify the healthcare provider. Normal aPTT is 30-40 seconds, and the therapeutic target range for heparin therapy is 1.5 to 2.5 times the baseline value (typically 60-80 seconds). An aPTT of 120 seconds is critically high and poses a severe bleeding risk. The heparin infusion must be stopped immediately. Protamine sulfate is the antidote but is reserved for severe, active hemorrhage, not just an elevated lab value unless ordered."
    },
    {
        "id": 2,
        "category": "Pharmacological and Parenteral Therapies",
        "question": "A client is scheduled to receive a dose of digoxin (Lanoxin) 0.25 mg PO. The client's apical pulse is 54 bpm. Which action should the nurse take first?",
        "options": [
            "Administer the medication and document the heart rate.",
            "Withhold the dose and check the serum potassium level.",
            "Withhold the dose and notify the healthcare provider.",
            "Obtain a 12-lead ECG."
        ],
        "correctIndex": 2,
        "rationale": "Correct Answer: Withhold the dose and notify the healthcare provider. Digoxin is a positive inotrope and negative chronotrope. It slows the heart rate. In adults, digoxin should be withheld if the apical heart rate is less than 60 bpm. The nurse must withhold the medication and notify the provider."
    },
    {
        "id": 3,
        "category": "Pharmacological and Parenteral Therapies",
        "question": "A nurse is administering a blood transfusion to a client. Fifteen minutes after starting the transfusion, the client reports chills, low back pain, and dyspnea. What is the priority action?",
        "options": [
            "Slow the infusion rate and call the healthcare provider.",
            "Stop the transfusion immediately and disconnect the tubing at the hub.",
            "Administer diphenhydramine (Benadryl) as ordered.",
            "Obtain the client's vital signs and double-check the blood bag label."
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: Stop the transfusion immediately and disconnect the tubing at the hub. The client's symptoms (chills, low back pain, dyspnea) indicate an acute hemolytic transfusion reaction, a life-threatening emergency. The infusion must be stopped immediately to limit the volume of incompatible blood infused. The tubing must be disconnected at the hub, and a new IV line with normal saline started to keep the vein open. Do not flush the remaining blood from the tubing."
    },
    # 2. Reduction of Risk Potential
    {
        "id": 4,
        "category": "Reduction of Risk Potential",
        "question": "A nurse is caring for a patient who is post-operative day 1 following a total hip arthroplasty. The patient reports sudden onset of chest pain, shortness of breath, and appears highly anxious. What is the first action the nurse should take?",
        "options": [
            "Obtain a 12-lead electrocardiogram (ECG).",
            "Assess the surgical site for signs of hemorrhage.",
            "Administer the prescribed PRN morphine for chest pain.",
            "Apply oxygen via nasal cannula and elevate the head of the bed."
        ],
        "correctIndex": 3,
        "rationale": "Correct Answer: Apply oxygen via nasal cannula and elevate the head of the bed. Sudden chest pain, dyspnea, and anxiety in a post-op orthopedic patient are classic signs of a Pulmonary Embolism (PE), a life-threatening complication. Immediate nursing actions focus on improving oxygenation (administering oxygen) and reducing work of breathing (elevating the head of bed/High Fowler's). Then, notify the provider immediately."
    },
    {
        "id": 5,
        "category": "Reduction of Risk Potential",
        "question": "The nurse is reviewing the lab results of a client receiving warfarin (Coumadin) therapy for atrial fibrillation. The INR is 4.8. The client shows no signs of bleeding. Which action should the nurse anticipate?",
        "options": [
            "Hold the next dose of warfarin and prepare to administer Vitamin K.",
            "Administer protamine sulfate IV push.",
            "Increase the next dose of warfarin to prevent stroke.",
            "Prepare the client for emergency hemodialysis."
        ],
        "correctIndex": 0,
        "rationale": "Correct Answer: Hold the next dose of warfarin and prepare to administer Vitamin K. The therapeutic INR range for atrial fibrillation is 2.0-3.0. An INR of 4.8 is significantly elevated, placing the client at high risk for bleeding. The nurse should hold the next dose and anticipate administering Vitamin K (phytonadione), which is the antidote for warfarin."
    },
    # 3. Physiological Adaptation
    {
        "id": 6,
        "category": "Physiological Adaptation",
        "question": "A patient diagnosed with type 1 diabetes is admitted to the ICU with Diabetic Ketoacidosis (DKA). The nurse is reviewing the lab results and arterial blood gases. Which findings would the nurse anticipate?",
        "options": [
            "pH 7.48, PaCO2 30 mmHg, HCO3- 23 mEq/L",
            "pH 7.28, PaCO2 38 mmHg, HCO3- 15 mEq/L",
            "pH 7.32, PaCO2 50 mmHg, HCO3- 28 mEq/L",
            "pH 7.50, PaCO2 48 mmHg, HCO3- 32 mEq/L"
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: pH 7.28, PaCO2 38 mmHg, HCO3- 15 mEq/L. DKA causes metabolic acidosis. This is indicated by a low pH (<7.35) and a low bicarbonate level (<22 mEq/L) with normal or slightly decreased PaCO2 (due to compensatory hyperventilation/Kussmaul breathing). Option B shows an acidic pH and low HCO3-, fitting metabolic acidosis."
    },
    {
        "id": 7,
        "category": "Physiological Adaptation",
        "question": "A client with chronic kidney disease (CKD) has a serum potassium level of 6.2 mEq/L. Which ECG change should the nurse monitor for?",
        "options": [
            "U waves and flat T waves.",
            "Prolonged QT interval and depressed ST segment.",
            "Tall, tented T waves and widened QRS complex.",
            "Prominent P waves and shortened PR interval."
        ],
        "correctIndex": 2,
        "rationale": "Correct Answer: Tall, tented T waves and widened QRS complex. Hyperkalemia (K+ > 5.0 mEq/L) is a cardiac emergency. The classic ECG changes include tall peaked/tented T waves, prolonged PR interval, flat or absent P waves, depressed ST segment, and widening of the QRS complex, which can progress to ventricular fibrillation or asystole."
    },
    # 4. Safe and Effective Care Environment
    {
        "id": 8,
        "category": "Safe and Effective Care Environment",
        "question": "The nurse receives a telephone order from a healthcare provider for a critical patient. Which action must the nurse take to ensure safety?",
        "options": [
            "Write the order down, read it back to the provider, and receive confirmation.",
            "Administer the medication immediately and document the verbal order later.",
            "Ask another nurse to listen to the provider on speakerphone.",
            "Refuse the order and demand the provider enter it electronically."
        ],
        "correctIndex": 0,
        "rationale": "Correct Answer: Write the order down, read it back to the provider, and receive confirmation. Verbal/telephone orders pose high risks. The nurse must write the order, read it back (T.O.R.B. - Telephone Order Read Back), and have the provider verify it. This is a Joint Commission national patient safety goal."
    },
    {
        "id": 9,
        "category": "Safe and Effective Care Environment",
        "question": "Which task is most appropriate for the registered nurse (RN) to delegate to an unlicensed assistive personnel (UAP)?",
        "options": [
            "Assess a client's wound healing and document status.",
            "Provide discharge instructions to a client leaving the unit.",
            "Assist a stable client with ambulating to the bathroom.",
            "Administer a subcutaneous insulin injection."
        ],
        "correctIndex": 2,
        "rationale": "Correct Answer: Assist a stable client with ambulating to the bathroom. Delegation rules state that assessment, teaching, evaluation, and medication administration (E-A-T: Evaluate, Assess, Teach) must NOT be delegated to UAPs. Assisting a stable client with activities of daily living (ADLs), like ambulation, is safe and appropriate for a UAP."
    },
    # 5. Medical-Surgical
    {
        "id": 10,
        "category": "Medical-Surgical",
        "question": "A nurse is caring for a client with a closed head injury who is receiving Osmotic Diuretic (Mannitol) IV. Which assessment is the priority to monitor for therapeutic effectiveness?",
        "options": [
            "Increased urine output.",
            "Decreased intracranial pressure (ICP) and improved level of consciousness.",
            "Slight increase in blood pressure.",
            "Decreased body temperature."
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: Decreased intracranial pressure (ICP) and improved level of consciousness. Mannitol is an osmotic diuretic used to reduce cerebral edema and lower intracranial pressure. While it increases urine output, the priority therapeutic outcome for this specific client is the reduction of ICP, indicated by improved neurological status and level of consciousness."
    },
    {
        "id": 11,
        "category": "Medical-Surgical",
        "question": "A client is admitted with an acute exacerbation of ulcerative colitis. Which dietary prescription should the nurse anticipate?",
        "options": [
            "High-fiber, high-fat diet.",
            "Low-residue, high-protein diet.",
            "Clear liquid diet only.",
            "High-fiber, low-protein diet."
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: Low-residue, high-protein diet. During an acute flare of ulcerative colitis, a low-residue (low-fiber) diet is ordered to reduce bowel stimulation and rest the colon. A high-protein, high-calorie diet is necessary to promote healing and correct nutritional deficits caused by chronic diarrhea and malabsorption."
    },
    # 6. Mental Health
    {
        "id": 12,
        "category": "Mental Health",
        "question": "A client diagnosed with schizophrenia is experiencing auditory hallucinations telling them to 'hurt others.' What is the nurse's priority action?",
        "options": [
            "Tell the client that the voices are not real and they should ignore them.",
            "Ask the client directly what the voices are telling them to do.",
            "Place the client in restraints to prevent injury.",
            "Administer a PRN sedative and leave the client alone in a dark room."
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: Ask the client directly what the voices are telling them to do. In command hallucinations, safety is the priority. The nurse must assess the content of the hallucinations to evaluate the risk of harm to self or others. The nurse should acknowledge the client's feelings but state that they do not hear the voices, without arguing."
    },
    {
        "id": 13,
        "category": "Mental Health",
        "question": "A client is admitted to the psychiatric unit with a diagnosis of bipolar I disorder, manic phase. Which room assignment is most appropriate?",
        "options": [
            "A double room with a client experiencing acute depression.",
            "A single room close to the nurses' station.",
            "A double room with a client who is also manic.",
            "A quiet single room far from the nurses' station and activity areas."
        ],
        "correctIndex": 3,
        "rationale": "Correct Answer: A quiet single room far from the nurses' station and activity areas. Manic clients are highly distractible and easily overstimulated. To promote rest and decrease agitation, they should be placed in a quiet, low-stimulus environment. Placing them close to the noisy nurses' station or with another manic client will worsen hyperactive behavior."
    },
    # 7. Leadership & Management
    {
        "id": 14,
        "category": "Leadership",
        "question": "A nurse is the charge nurse in an emergency department when a multi-vehicle accident occurs. According to the disaster triage protocol (START method), which client should be assigned a RED tag (immediate priority)?",
        "options": [
            "A client with a compound femur fracture, awake, with active bleeding controlled by pressure.",
            "A client who is unconscious, with a respiratory rate of 34 breaths/minute.",
            "A client with no respirations after positioning the airway.",
            "A client with minor abrasions walking around the scene asking for help."
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: A client who is unconscious, with a respiratory rate of 34 breaths/minute. Under the START disaster triage system, red tags (immediate) are for clients with life-threatening injuries who can be saved with rapid intervention. Indicators include respiratory rate >30, absent radial pulse, or inability to follow simple commands. The client who is unconscious with RR 34 meets this criteria. compound fracture is yellow (delayed), no respirations is black (expectant), walking is green (minor)."
    },
    {
        "id": 15,
        "category": "Leadership",
        "question": "An RN is planning the care assignment for the day. Which client should be assigned to the Licensed Practical Nurse (LPN) rather than the RN?",
        "options": [
            "A client newly admitted with chest pain undergoing rule-out MI protocol.",
            "A client post-op day 3 following a colon resection who requires dressing changes and oral medications.",
            "A client with diabetes whose blood glucose is unstable and requires insulin drip titration.",
            "A client receiving a continuous infusion of chemotherapy."
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: A client post-op day 3 following a colon resection who requires dressing changes and oral medications. LPNs can care for stable clients with predictable outcomes. Post-op day 3 colon resection with standard dressing changes and oral meds is stable. Newly admitted chest pain, unstable blood glucose on an insulin drip, and chemotherapy are complex, unstable tasks requiring advanced clinical judgment and belong to the RN."
    },
    # 8. Pathophysiology
    {
        "id": 16,
        "category": "Pathophysiology",
        "question": "A client is diagnosed with Syndrome of Inappropriate Antidiuretic Hormone (SIADH). Which pathophysiological process explains the client's symptoms?",
        "options": [
            "Excessive ADH release leads to water retention, dilutional hyponatremia, and fluid overload.",
            "Insufficient ADH release leads to massive diuresis, dehydration, and hypernatremia.",
            "Excessive aldosterone secretion causes sodium and water retention with hyperkalemia.",
            "Decreased cortisol secretion causes hypoglycemia and severe hypotension."
        ],
        "correctIndex": 0,
        "rationale": "Correct Answer: Excessive ADH release leads to water retention, dilutional hyponatremia, and fluid overload. SIADH is characterized by excessive secretion of ADH, causing the kidneys to reabsorb too much water. This dilutes the extracellular fluid, causing dilutional hyponatremia. The clinical manifestations include fluid retention, weight gain without edema (since fluid is intracellular/intravascular), and neurologic symptoms from cerebral edema."
    },
    {
        "id": 17,
        "category": "Pathophysiology",
        "question": "Which compensatory mechanism occurs in a client experiencing hypovolemic shock?",
        "options": [
            "Parasympathetic nervous system stimulation, slowing the heart rate.",
            "Decreased release of renin and aldosterone, promoting sodium excretion.",
            "Vasodilation of peripheral blood vessels to increase skin perfusion.",
            "Activation of the renin-angiotensin-aldosterone system (RAAS) and vasoconstriction to maintain perfusion.",
            "Decreased secretion of antidiuretic hormone (ADH) to increase fluid output."
        ],
        "correctIndex": 3,
        "rationale": "Correct Answer: Activation of the renin-angiotensin-aldosterone system (RAAS) and vasoconstriction to maintain perfusion. In hypovolemic shock, the body attempts to compensate for blood loss. Sympathetic stimulation increases heart rate and causes vasoconstriction (shunting blood to vital organs). The kidneys release renin, activating the RAAS cascade to retain sodium/water and increase vascular volume to maintain cardiac output."
    },
    # 9. Additional high-yield questions
    {
        "id": 18,
        "category": "Pathophysiology",
        "question": "Which primary acid-base imbalance is caused by hyperventilation (e.g. during an acute panic attack)?",
        "options": [
            "Respiratory Acidosis",
            "Respiratory Alkalosis",
            "Metabolic Acidosis",
            "Metabolic Alkalosis"
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: Respiratory Alkalosis. Hyperventilation causes excessive elimination of carbon dioxide (CO2). Since CO2 is acid, dropping CO2 levels causes the blood pH to rise, leading to respiratory alkalosis (pH > 7.45, PaCO2 < 35)."
    },
    {
        "id": 19,
        "category": "Medical-Surgical",
        "question": "A client with acute pancreatitis reports severe epigastric pain radiating to the back. Which lab result should the nurse review to confirm this diagnosis?",
        "options": [
            "Serum creatinine and BUN",
            "Serum amylase and lipase",
            "ALT and AST liver enzymes",
            "Serum potassium and calcium"
        ],
        "correctIndex": 1,
        "rationale": "Correct Answer: Serum amylase and lipase. Acute pancreatitis is characterized by autodigestion of the pancreas by its own enzymes. Elevated serum amylase and lipase levels (often 3x normal) are the hallmark lab values used to confirm acute pancreatitis."
    },
    {
        "id": 20,
        "category": "Leadership",
        "question": "A nurse is planning to delegate vital signs assessment for a newly admitted, unstable patient in cardiogenic shock. Who can this task be delegated to?",
        "options": [
            "An experienced LPN.",
            "An unlicensed assistive personnel (UAP).",
            "A second RN.",
            "Either an LPN or a UAP."
        ],
        "correctIndex": 2,
        "rationale": "Correct Answer: A second RN. While vital signs are normally delegable to UAPs or LPNs, this client is *unstable* and in cardiogenic shock. Assessments of unstable patients require critical judgment and analysis of vitals, which must be performed by the registered nurse."
    }
]

SIMULATION_CASES = {
    "er": {
        "title": "ER Case: Acute Asthma Exacerbation",
        "desc": "A 24-year-old female presents to the triage desk with severe dyspnea, wheezing, and is speaking in one-word sentences. She states she used her albuterol inhaler 5 times at home with no relief.",
        "initialVitals": {"hr": 124, "bp": "138/86", "spo2": 88, "rr": 28},
        "sbar": {
            "s": "24-year-old female presenting with severe acute asthma exacerbation.",
            "b": "History of moderate persistent asthma. Home medications include Fluticasone/Salmeterol daily and Albuterol PRN. Presenting after failing home rescue rescue therapies.",
            "a": "Accessory muscle use, diminished breath sounds bilaterally, audible wheezes, tachycardia, and hypoxemia.",
            "r": "Awaiting immediate bronchodilator therapy, corticosteroids, and oxygen administration."
        },
        "steps": [
            {
                "text": "The patient is placed in the resuscitation bay. She is highly anxious, using intercostal muscles to breathe. Airway is patent but tight. What is your immediate priority action?",
                "vitals": {"hr": 124, "bp": "138/86", "spo2": 88, "rr": 28},
                "options": [
                    {"text": "Administer high-flow oxygen via non-rebreather mask and start continuous Albuterol/Ipratropium nebulizer.", "score": 10, "next": 1, "feedback": "Excellent. High-flow oxygen and rapid-acting bronchodilator nebulizers are the first-line therapies to address acute hypoxemia and bronchoconstriction."},
                    {"text": "Perform a comprehensive head-to-toe physical assessment and take a detailed medical history.", "score": 2, "next": 1, "feedback": "Incorrect priority. While assessment is key, the patient is in acute respiratory distress. You must stabilize oxygenation and bronchoconstriction first."},
                    {"text": "Prepare for immediate endotracheal intubation.", "score": 5, "next": 1, "feedback": "Caution. Intubation is a last resort in asthma due to high risk of barotrauma and bronchospasm. Try medical management (oxygen, nebs, steroids) first."}
                ]
            },
            {
                "text": "You start the continuous nebulizer and apply oxygen. Her SpO2 rises to 94%. After 15 minutes, you auscultate her lungs and note 'silent chest' (no air movement heard). What is the significance of this finding?",
                "vitals": {"hr": 110, "bp": "128/80", "spo2": 94, "rr": 24},
                "options": [
                    {"text": "The wheezing has stopped; this indicates the bronchospasm is resolving.", "score": 0, "next": 2, "feedback": "Dangerous assumption! A 'silent chest' in asthma means there is not enough air movement even to produce a wheeze. The patient is near respiratory arrest."},
                    {"text": "This indicates severe airway obstruction and impending respiratory failure. Prepare for emergency intervention (Epi/IV magnesium/intubation).", "score": 10, "next": 2, "feedback": "Correct. A silent chest is a critical, life-threatening emergency indicating minimal to no ventilation."},
                    {"text": "Decrease the oxygen flow rate to avoid oxygen toxicity.", "score": 1, "next": 2, "feedback": "Incorrect. The patient is in respiratory failure. Do not restrict oxygen."}
                ]
            },
            {
                "text": "Emergency interventions (IV Methylprednisolone and IV Magnesium Sulfate infusion) are administered. Airway re-assessment reveals coarse wheezing bilaterally, indicating air movement has returned. The patient's respiratory rate drops to 18, and SpO2 stabilizes at 97%. What is the appropriate next step?",
                "vitals": {"hr": 94, "bp": "120/78", "spo2": 97, "rr": 18},
                "options": [
                    {"text": "Prepare the patient for transfer to the ICU/Medical Ward for observation and continue steroids.", "score": 10, "next": "complete", "feedback": "Correct! The patient has stabilized but requires monitoring and serial assessments to ensure she does not rebound."},
                    {"text": "Discharge the patient home with instructions to double her steroid inhaler.", "score": 2, "next": "complete", "feedback": "Unsafe. A patient who required magnesium sulfate in the ER for a silent chest cannot be discharged immediately; they require ward admission."}
                ]
            }
        ]
    },
    "icu": {
        "title": "ICU Case: Septic Shock",
        "desc": "An 82-year-old male is admitted from a nursing home with altered mental status, high fever, and severe hypotension. Suspected source is a urinary tract infection (UTI).",
        "initialVitals": {"hr": 118, "bp": "82/42", "spo2": 92, "rr": 24},
        "sbar": {
            "s": "82-year-old male in septic shock secondary to urosepsis.",
            "b": "History of benign prostatic hyperplasia (BPH) and dementia. Admitted with high fevers and lethargy.",
            "a": "Hypotensive, tachycardic, febrile (102.4F), warm/flushed skin, and oliguria (<20mL/hr). Lactic acid is 4.2 mmol/L.",
            "r": "Needs aggressive fluid resuscitation, broad-spectrum antibiotics, and possible vasopressors."
        },
        "steps": [
            {
                "text": "The patient is lethargic. MAP (Mean Arterial Pressure) is 55 mmHg (Normal > 65). The provider orders the Sepsis Bundle. What is your first priority?",
                "vitals": {"hr": 118, "bp": "82/42", "spo2": 92, "rr": 24},
                "options": [
                    {"text": "Establish large-bore IV access, draw blood cultures (x2), and administer 30 mL/kg of Normal Saline/Lactated Ringer's infusion.", "score": 10, "next": 1, "feedback": "Excellent. Fluid resuscitation is the cornerstone of early septic shock treatment, and blood cultures must be drawn before administering antibiotics."},
                    {"text": "Administer broad-spectrum IV Piperacillin/Tazobactam immediately.", "score": 5, "next": 1, "feedback": "Caution. You must draw blood cultures *prior* to administering the first dose of antibiotics, otherwise culture results will be compromised."},
                    {"text": "Start a Norepinephrine infusion.", "score": 3, "next": 1, "feedback": "Incorrect priority. Vasopressors should only be started *after* adequate fluid resuscitation (30 mL/kg) has failed to restore MAP."}
                ]
            },
            {
                "text": "After 2 liters of crystalloid fluids, the patient's blood pressure remains low at 86/46 (MAP 59 mmHg). Urine output is only 15 mL in the last hour. What is the next step to maintain organ perfusion?",
                "vitals": {"hr": 112, "bp": "86/46", "spo2": 94, "rr": 22},
                "options": [
                    {"text": "Administer another 3 liters of fluids rapidly.", "score": 4, "next": 2, "feedback": "Risky. Over-resuscitation can lead to pulmonary edema. Since fluid challenge failed, vasopressors are indicated."},
                    {"text": "Initiate Norepinephrine infusion titrated to maintain MAP > 65 mmHg.", "score": 10, "next": 2, "feedback": "Correct. Norepinephrine is the first-choice vasopressor for septic shock refactory to fluid resuscitation."},
                    {"text": "Give 40mg of IV Furosemide to stimulate kidneys.", "score": 1, "next": 2, "feedback": "Dangerous! The patient is in shock and hypovolemic. Diuretics will worsen hypotension and kidney injury."}
                ]
            },
            {
                "text": "Norepinephrine is infusing at 8 mcg/min. MAP is now 68 mmHg. Broad-spectrum antibiotics are infusing, and blood culture results are pending. The patient begins to wake up and follows commands. What is the priority assessment?",
                "vitals": {"hr": 92, "bp": "102/62", "spo2": 96, "rr": 18},
                "options": [
                    {"text": "Assess the IV infusion site for extravasation (Norepinephrine is a severe vesicant).", "score": 10, "next": "complete", "feedback": "Excellent! Vasopressors are vesicants. Extravasation causes tissue necrosis. You must check the site hourly and use a central line if possible."},
                    {"text": "Check blood sugar levels every 15 minutes.", "score": 3, "next": "complete", "feedback": "Not a priority unless the patient is on an insulin drip."}
                ]
            }
        ]
    },
    "peds": {
        "title": "Pediatric Case: Laryngotracheobronchitis (Croup)",
        "desc": "A 2-year-old male is brought to the ER by his parents at midnight with a harsh, barking cough, inspiratory stridor, and mild subcostal retractions.",
        "initialVitals": {"hr": 138, "bp": "92/60", "spo2": 94, "rr": 32},
        "sbar": {
            "s": "2-year-old male presenting with acute croup exacerbation.",
            "b": "Had mild upper respiratory symptoms for 2 days. Barking cough developed tonight.",
            "a": "Inspiratory stridor at rest, barking cough, mild retractions, and SpO2 94% on room air.",
            "r": "Awaiting airway assessment, cool mist therapy, corticosteroids, or nebulized epinephrine."
        },
        "steps": [
            {
                "text": "The child is crying in his mother's arms, which worsens the inspiratory stridor. What is the best initial approach to care?",
                "vitals": {"hr": 138, "bp": "92/60", "spo2": 94, "rr": 32},
                "options": [
                    {"text": "Keep the child in the mother's lap, maintain a calm environment, and provide blow-by humidified oxygen/cool mist.", "score": 10, "next": 1, "feedback": "Correct. Agitation increases airway resistance in stridor. Keeping the child calm in the parent's arms is critical."},
                    {"text": "Immediately separate the child and place him on an examination table for a thorough oral examination using a tongue depressor.", "score": 0, "next": 1, "feedback": "Dangerous! If the diagnosis is Epiglottitis (which presents similarly with stridor/drooling), placing a tongue depressor in the throat can trigger laryngospasm and complete airway closure."}
                ]
            },
            {
                "text": "The provider diagnoses Croup and orders a medication to decrease airway swelling. Which medication is standard for moderate-to-severe Croup?",
                "vitals": {"hr": 128, "bp": "90/58", "spo2": 96, "rr": 28},
                "options": [
                    {"text": "Oral or IM Dexamethasone (Corticosteroid).", "score": 10, "next": 2, "feedback": "Correct. Corticosteroids reduce laryngeal mucosal edema and are standard first-line therapy for croup."},
                    {"text": "Nebulized Albuterol.", "score": 3, "next": 2, "feedback": "Albuterol acts on lower airways (bronchioles) and is not effective for upper airway laryngeal edema seen in croup."}
                ]
            },
            {
                "text": "The child is discharged home after 4 hours of observation. He has no stridor at rest. What is the most important discharge education for the parents?",
                "vitals": {"hr": 110, "bp": "92/60", "spo2": 98, "rr": 24},
                "options": [
                    {"text": "Take the child outside into the cool night air or run a hot shower to create a humid room if barking cough returns. Seek immediate care if breathing is labored.", "score": 10, "next": "complete", "feedback": "Excellent. Cool air or steam helps reduce airway swelling in croup."},
                    {"text": "Administer children's cough suppressants every 4 hours.", "score": 1, "next": "complete", "feedback": "Avoid cough suppressants; they can mask worsening airway obstruction."}
                ]
            }
        ]
    },
    "maternity": {
        "title": "Maternity Case: Postpartum Hemorrhage (PPH)",
        "desc": "A 28-year-old G1P1 female is in the recovery room 30 minutes after a vaginal delivery of a 9 lb 2 oz infant. The nurse notes a large amount of rubra lochia on the underpad and a boggy uterus.",
        "initialVitals": {"hr": 110, "bp": "96/54", "spo2": 98, "rr": 20},
        "sbar": {
            "s": "Postpartum patient experiencing acute postpartum hemorrhage.",
            "b": "Delivered a macrosomic infant (9lb 2oz) after a prolonged second stage of labor.",
            "a": "Uterus is boggy, located 2cm above the umbilicus and deviated to the right. Moderate-to-heavy active bleeding.",
            "r": "Needs immediate uterine assessment, bladder checks, uterotonic medications, and IV access."
        },
        "steps": [
            {
                "text": "Upon assessing the patient, the uterus is boggy (soft) and deviated to the right. What is your first immediate action?",
                "vitals": {"hr": 110, "bp": "96/54", "spo2": 98, "rr": 20},
                "options": [
                    {"text": "Perform a firm fundal massage to stimulate contraction and check if the patient needs to void (bladder distension deviates the uterus).", "score": 10, "next": 1, "feedback": "Excellent. Fundal massage is the immediate action to contract the uterine muscle. A full bladder blocks contraction; emptying it is a priority."},
                    {"text": "Administer IV Oxytocin immediately.", "score": 5, "next": 1, "feedback": "Uterotonics are essential, but you must first perform fundal massage to mechanically stimulate the uterus."},
                    {"text": "Notify the physician to prepare for a blood transfusion.", "score": 2, "next": 1, "feedback": "Assess and perform massage first before calling, unless shock is severe."}
                ]
            },
            {
                "text": "You massaged the fundus and expelled several large clots. The patient voided 400 mL via bedpan. The uterus remains boggy, and lochia is still heavy. The provider orders Oxytocin 20 units in 1L Lactated Ringer's. What is your next step?",
                "vitals": {"hr": 115, "bp": "92/50", "spo2": 97, "rr": 22},
                "options": [
                    {"text": "Infuse the Oxytocin IV solution and assess vitals. Prepare secondary uterotonics (e.g. Methylergonovine or Carboprost).", "score": 10, "next": 2, "feedback": "Correct. Oxytocin is first-line. If the uterus remains boggy (atonic), secondary agents are needed."},
                    {"text": "Administer Methylergonovine (Methergine) IM to a patient with a history of severe gestational hypertension.", "score": 1, "next": 2, "feedback": "Dangerous! Methergine is a vasoconstrictor and is strictly contraindicated in patients with hypertension due to stroke risk."}
                ]
            },
            {
                "text": "The Oxytocin is infusing, and a dose of Carboprost (Hemabate) is given. The uterus becomes firm and contracted, located at the umbilicus. Bleeding decreases to normal. What is your priority monitoring focus?",
                "vitals": {"hr": 88, "bp": "110/68", "spo2": 98, "rr": 16},
                "options": [
                    {"text": "Monitor fundal firmness and lochia amount every 15 minutes, and check blood pressure.", "score": 10, "next": "complete", "feedback": "Correct. PPH can recur. Continual monitoring of fundal tone and bleeding is essential in the recovery period."},
                    {"text": "Encourage immediate ambulation.", "score": 1, "next": "complete", "feedback": "Do not ambulate a patient immediately after a PPH and epidural recovery."}
                ]
            }
        ]
    },
    "med_surg": {
        "title": "Med-Surg Case: Post-Op Pulmonary Embolism",
        "desc": "A 62-year-old male is recovering on the medical-surgical unit after a total knee replacement yesterday. He suddenly calls the light reporting severe, sharp right-sided chest pain when breathing and extreme shortness of breath.",
        "initialVitals": {"hr": 116, "bp": "104/68", "spo2": 85, "rr": 28},
        "sbar": {
            "s": "62-year-old male post-op total knee replacement showing signs of acute pulmonary embolism.",
            "b": "Post-op day 1. Minimal ambulation so far due to pain. Prophylactic anticoagulation was ordered but not yet administered today.",
            "a": "Acute onset of pleuritic chest pain, tachypnea, severe tachycardia, and hypoxia (SpO2 85% on room air). Patient is highly anxious and diaphoretic.",
            "r": "Immediate oxygen support, high-Fowler's positioning, provider notification, and STAT chest CT scan or anticoagulation evaluation."
        },
        "steps": [
            {
                "text": "You enter the room and find the patient sitting on the edge of the bed gasping for air, clutching his right side. SpO2 is reading 85%. What is your first priority action?",
                "vitals": {"hr": 116, "bp": "104/68", "spo2": 85, "rr": 28},
                "options": [
                    {"text": "Apply high-flow oxygen via simple face mask or nasal cannula, and place the patient in High-Fowler's position.", "score": 10, "next": 1, "feedback": "Perfect. Oxygenation and positioning are immediate life-saving priorities to decrease dyspnea and increase gas exchange."},
                    {"text": "Prepare to administer the scheduled PO Warfarin dose.", "score": 1, "next": 1, "feedback": "Incorrect. PO warfarin takes days to become therapeutic and will not address an acute pulmonary embolism crisis, and oral administration during acute respiratory distress is a choking risk."},
                    {"text": "Encourage deep breathing and coughing exercises.", "score": 3, "next": 1, "feedback": "Ineffective. Deep breathing alone cannot overcome a vascular blockage in the lungs (pulmonary embolism). Oxygen is required."}
                ]
            },
            {
                "text": "The patient is in High-Fowler's with oxygen flowing. SpO2 rises to 92%. The physician arrives and confirms a suspected PE. A STAT CT Angiography (CTA) of the chest is ordered. Which lab value is critical to review before sending the patient to the scan?",
                "vitals": {"hr": 106, "bp": "110/72", "spo2": 92, "rr": 22},
                "options": [
                    {"text": "Serum Creatinine and BUN (to evaluate renal function for CT contrast clearance).", "score": 10, "next": 2, "feedback": "Excellent! CT angiography requires nephrotoxic iodine contrast. You must check renal function to prevent contrast-induced nephropathy."},
                    {"text": "Complete Blood Count (CBC).", "score": 3, "next": 2, "feedback": "While platelets are useful, checking renal function is the priority due to the immediate risk of kidney damage from contrast dye."}
                ]
            },
            {
                "text": "The scan confirms a large pulmonary embolism in the right lower lobe. The provider orders a continuous Heparin infusion. Which medication protocol should you establish?",
                "vitals": {"hr": 98, "bp": "112/74", "spo2": 94, "rr": 20},
                "options": [
                    {"text": "Administer an IV Heparin bolus, start the continuous infusion, and monitor aPTT levels every 6 hours.", "score": 10, "next": "complete", "feedback": "Correct. Heparin continuous infusion is the standard treatment for acute PE. Serial aPTT draws ensure the patient remains in the therapeutic range without overdosing."},
                    {"text": "Start the Heparin infusion and prepare Protamine Sulfate to be administered concurrently.", "score": 0, "next": "complete", "feedback": "Dangerous! Protamine sulfate is the antidote. Administering it concurrently will neutralize the heparin, leaving the PE untreated."}
                ]
            }
        ]
    },
    "mental_health": {
        "title": "Mental Health Case: Acute Schizophrenic Agitation",
        "desc": "A 29-year-old male is admitted to the psychiatric unit with an acute exacerbation of schizophrenia. He is pacing the hallway, muttering to himself, and clenching his fists, looking highly agitated.",
        "initialVitals": {"hr": 112, "bp": "138/92", "spo2": 98, "rr": 22},
        "sbar": {
            "s": "29-year-old male showing signs of escalating psychomotor agitation.",
            "b": "History of paranoid schizophrenia. Non-compliant with antipsychotic medications at home for 2 weeks.",
            "a": "Pacing, clenching fists, talking to unseen entities. Verbalizing feelings of paranoia ('They are trying to poison me'). Vitals show sympathetic activation (tachycardia, mild hypertension).",
            "r": "Requires verbal de-escalation, a low-stimulus environment, and evaluation for PRN atypical antipsychotics or sedatives."
        },
        "steps": [
            {
                "text": "The patient suddenly stops pacing, points at a dietary cart, and yells, 'There is poison in that food! You are all trying to kill me!' How should the nurse respond?",
                "vitals": {"hr": 112, "bp": "138/92", "spo2": 98, "rr": 22},
                "options": [
                    {"text": "State calmly: 'I understand that you are feeling scared, but the food is safe. I am here to keep you safe.'", "score": 10, "next": 1, "feedback": "Excellent therapeutic communication. You validated the client's feelings of fear, presented reality without arguing or validating the delusion, and offered safety."},
                    {"text": "Tell him: 'That is ridiculous. Nobody is trying to poison you. Eat your food.'", "score": 0, "next": 1, "feedback": "Incorrect. Arguing with a delusional patient will increase paranoia, defensiveness, and the risk of aggression."},
                    {"text": "Say: 'Yes, the dietary staff is dangerous. I will protect you from them.'", "score": 1, "next": 1, "feedback": "Dangerous. You must never validate, agree with, or reinforce a patient's delusion, as this reinforces their paranoia."}
                ]
            },
            {
                "text": "The patient remains agitated but listens to your voice. He continues to clench his fists. You need to offer a medication to help him calm down. Which combination is standard for acute psychiatric agitation?",
                "vitals": {"hr": 108, "bp": "136/88", "spo2": 99, "rr": 20},
                "options": [
                    {"text": "Haloperidol (First-Gen Antipsychotic) and Lorazepam (Benzodiazepine) IM.", "score": 10, "next": 2, "feedback": "Correct. Haloperidol (Haldol) and Lorazepam (Ativan) are commonly given together (often referred to as a 'Haldol cocktail') to treat acute agitation by targeting both psychosis and anxiety."},
                    {"text": "Lithium Carbonate PO.", "score": 2, "next": 2, "feedback": "Lithium takes 1-2 weeks to reach therapeutic levels and is used for bipolar mania, not rapid de-escalation of acute schizophrenic agitation."}
                ]
            },
            {
                "text": "The patient accepts the medications. After 45 minutes, he is resting quietly in his room. Which nursing action is the priority now?",
                "vitals": {"hr": 84, "bp": "118/74", "spo2": 98, "rr": 14},
                "options": [
                    {"text": "Monitor the patient's vital signs and check for Extrapyramidal Side Effects (EPS) or acute dystonia from Haloperidol.", "score": 10, "next": "complete", "feedback": "Correct! Haloperidol poses high risks for Extrapyramidal Symptoms (EPS), such as muscle spasms, stiffness, or oculogyric crisis. Monitor closely for these side effects."},
                    {"text": "Initiate group therapy immediately in his room.", "score": 1, "next": "complete", "feedback": "Unsafe. The patient has just been sedated and needs rest in a low-stimulus environment, not social interaction."}
                ]
            }
        ]
    },
    "leadership": {
        "title": "Leadership Case: Delegation and Prioritization",
        "desc": "You are the charge nurse on a 30-bed medical-surgical unit. You have 2 Registered Nurses (RNs), 1 Licensed Practical Nurse (LPN), and 1 Unlicensed Assistive Personnel (UAP) on your team.",
        "initialVitals": {"hr": 72, "bp": "120/80", "spo2": 98, "rr": 16},
        "sbar": {
            "s": "Charge nurse managing staffing, assignments, and delegation on a med-surg unit.",
            "b": "Morning shift. Five new admissions arriving from the ER. High acuity.",
            "a": "Identifying appropriate tasks based on scopes of practice. Assigning tasks to ensure patient safety.",
            "r": "Applying delegation rules (RN: complex/unstable; LPN: stable/predictable; UAP: ADLs/vitals)."
        },
        "steps": [
            {
                "text": "A new patient has just arrived from the ER following a total thyroidectomy. The patient is stable but needs a complete admission assessment and initial teaching. Who should you assign this patient to?",
                "vitals": {"hr": 72, "bp": "120/80", "spo2": 98, "rr": 16},
                "options": [
                    {"text": "Assign to the Registered Nurse (RN).", "score": 10, "next": 1, "feedback": "Correct. Admission assessments and initial education require advanced clinical judgment, which is within the RN's scope and cannot be delegated to an LPN or UAP."},
                    {"text": "Assign to the Licensed Practical Nurse (LPN) with the UAP doing the teaching.", "score": 1, "next": 1, "feedback": "Incorrect. LPNs cannot perform initial admission assessments, and UAPs are strictly prohibited from patient education."}
                ]
            },
            {
                "text": "An existing patient, post-op day 3 from a bowel resection, is stable and needs a dressing change and their morning oral medications. Who is the most appropriate team member to assign this to?",
                "vitals": {"hr": 72, "bp": "120/80", "spo2": 98, "rr": 16},
                "options": [
                    {"text": "Assign to the Licensed Practical Nurse (LPN).", "score": 10, "next": 2, "feedback": "Excellent. LPNs are licensed to administer oral/subcutaneous medications and perform sterile dressing changes for stable, predictable patients."},
                    {"text": "Assign to the Unlicensed Assistive Personnel (UAP).", "score": 0, "next": 2, "feedback": "Dangerous. UAPs cannot administer medications or perform sterile dressing changes."}
                ]
            },
            {
                "text": "You need to measure vital signs on a stable patient who is ready for discharge, and also perform a blood glucose check on a stable diabetic patient before lunch. Who is the most appropriate team member?",
                "vitals": {"hr": 72, "bp": "120/80", "spo2": 98, "rr": 16},
                "options": [
                    {"text": "Delegate both tasks to the Unlicensed Assistive Personnel (UAP).", "score": 10, "next": "complete", "feedback": "Correct. UAPs are trained and permitted to perform routine, standard tasks like obtaining vital signs and capillary blood glucose checks on stable patients."},
                    {"text": "Assign both tasks to the RN.", "score": 4, "next": "complete", "feedback": "While the RN *can* do these, it is poor resource management. Using the UAP allows the RN to focus on assessments and complex care."}
                ]
            }
        ]
    },
    "pathophysiology": {
        "title": "Pathophysiology Case: SIADH vs Diabetes Insipidus",
        "desc": "A 45-year-old male is admitted to the neuro ICU after sustaining a traumatic brain injury (TBI) in a motor vehicle accident. He suddenly begins excreting massive amounts of clear urine.",
        "initialVitals": {"hr": 110, "bp": "88/50", "spo2": 96, "rr": 18},
        "sbar": {
            "s": "45-year-old male post-TBI presenting with sudden polyuria (>500mL/hr) and hypotension.",
            "b": "Admitted 12 hours ago. Intracranial pressure is stable. Urine output was normal until 1 hour ago.",
            "a": "Polyuria, extreme thirst, tachycardia, hypotension, poor skin turgor. Urine specific gravity is 1.002. Serum sodium is 152 mEq/L.",
            "r": "Needs differential diagnosis between DI and SIADH, and fluid/hormone therapy."
        },
        "steps": [
            {
                "text": "The patient's urine output is 600 mL in the last hour. Specific gravity is 1.002 (Normal 1.005 - 1.030). Serum Sodium is 152 mEq/L (Normal 135 - 145). What is the underlying pathophysiological process occurring?",
                "vitals": {"hr": 110, "bp": "88/50", "spo2": 96, "rr": 18},
                "options": [
                    {"text": "Diabetes Insipidus (DI) caused by a lack of ADH release from the damaged posterior pituitary, leading to water dumping.", "score": 10, "next": 1, "feedback": "Correct! TBI often damages the hypothalamus/pituitary gland, stopping ADH release. Without ADH, the kidneys cannot reabsorb water, causing massive dilute polyuria and hypernatremia."},
                    {"text": "Syndrome of Inappropriate Antidiuretic Hormone (SIADH) causing water retention and dilutional hyponatremia.", "score": 0, "next": 1, "feedback": "Incorrect. SIADH causes water *retention* and low sodium. This patient is dumping water (polyuria) and has high sodium (hypernatremia)."}
                ]
            },
            {
                "text": "The patient is diagnosed with Central Diabetes Insipidus. He is hypotensive. Which medication should you anticipate administering to replace the missing ADH?",
                "vitals": {"hr": 108, "bp": "90/52", "spo2": 96, "rr": 18},
                "options": [
                    {"text": "Desmopressin (DDAVP) - a synthetic analog of ADH.", "score": 10, "next": 2, "feedback": "Correct. Desmopressin (DDAVP) replaces the missing antidiuretic hormone, causing the kidneys to reabsorb water and concentrate the urine."},
                    {"text": "Spironolactone (Aldosterone Antagonist).", "score": 1, "next": 2, "feedback": "Incorrect. Spironolactone is a potassium-sparing diuretic. Giving a diuretic will worsen the severe dehydration and shock."}
                ]
            },
            {
                "text": "You administered Desmopressin. Urine output drops to 50 mL/hr, and urine specific gravity rises to 1.015. What is the priority nursing assessment to prevent complications of therapy?",
                "vitals": {"hr": 82, "bp": "118/72", "spo2": 98, "rr": 16},
                "options": [
                    {"text": "Monitor serum sodium levels and watch for signs of fluid overload/hyponatremia (headache, confusion) due to potential water intoxication.", "score": 10, "next": "complete", "feedback": "Excellent. Desmopressin can cause too much water retention, leading to water intoxication and dilutional hyponatremia. Monitor sodium and neuro status closely."},
                    {"text": "Check deep tendon reflexes every hour.", "score": 2, "next": "complete", "feedback": "Not a priority for desmopressin therapy; sodium/water balance is key."}
                ]
            }
        ]
    }
}

CRITICAL_LAB_VALUES = [
    {"name": "Potassium (K⁺)", "range": "3.5 – 5.0 mEq/L", "sig": "Critical value. Dysrhythmias, ECG changes (T-waves)."},
    {"name": "Sodium (Na⁺)", "range": "135 – 145 mEq/L", "sig": "Neurological changes, seizure risk below 120 or above 160."},
    {"name": "Calcium (Ca²⁺)", "range": "9.0 – 10.5 mg/dL", "sig": "Chvostek's & Trousseau's sign (hypocalcemia)."},
    {"name": "pH (ABG)", "range": "7.35 – 7.45", "sig": "Acid-base balance. Metabolic or respiratory origin."},
    {"name": "BUN", "range": "10 – 20 mg/dL", "sig": "Elevated represents dehydration or renal impairment."},
    {"name": "Creatinine", "range": "0.6 – 1.2 mg/dL", "sig": "Primary indicator of kidney function."},
    {"name": "Platelets", "range": "150,000 – 400,000 /mm³", "sig": "Bleeding precautions if < 50,000."}
]

DRUG_CARDS = {
    "digoxin": {
        "name": "Digoxin (Lanoxin)",
        "class": "Cardiac Glycoside, Positive Inotrope",
        "ind": "Heart failure, atrial fibrillation.",
        "action": "Increases force of myocardial contraction while slowing heart rate (chronotropic effect).",
        "nursing": "Count apical pulse for 1 full minute. Withhold dose if HR < 60 bpm. Therapeutic level: 0.5 - 2.0 ng/mL. Toxicity causes yellow-green halos, nausea, and bradycardia. Hypokalemia increases risk of Digoxin toxicity."
    },
    "heparin": {
        "name": "Heparin Sodium",
        "class": "Anticoagulant",
        "ind": "Prophylaxis and treatment of venous thromboembolisms (DVT, PE).",
        "action": "Prevents conversion of fibrinogen to fibrin, stopping clot enlargement.",
        "nursing": "Monitor partial thromboplastin time (aPTT) frequently. Target range: 1.5 - 2.5 times baseline. Watch for bleeding (gums, blood in urine/stool). Implement bleeding precautions. Antidote: Protamine Sulfate."
    },
    "furosemide": {
        "name": "Furosemide (Lasix)",
        "class": "Loop Diuretic",
        "ind": "Edema associated with HF, renal disease, and hypertension.",
        "action": "Inhibits reabsorption of sodium and chloride in the loop of Henle, promoting diuresis.",
        "nursing": "Monitor blood pressure and intake/output. Monitor serum potassium levels closely; causes hypokalemia. Give slowly via IV push (to prevent ototoxicity/tinnitus)."
    }
}

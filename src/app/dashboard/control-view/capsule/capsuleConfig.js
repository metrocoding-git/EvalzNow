// Capsule (Capacity Accounting) – fixed lists and defaults from "Workflow with Capacity" (Capacity_Part2 / Part3).

export const CAPSULE_TYPES = ["Capacity - Combined", "Capacity - Isolated"];
export const CAPSULE_SIGNATURE_PROFILES = ["Case 1: Solid Balanced"];
export const CAPSULE_ENVIRONMENTS = ["Clinical-Neuro"];
export const CAPSULE_FRAMEWORK_AGES = ["< 1 year", "1-2 years", "3-5 years", "6-10 years", "> 10 years"];

// Capsule roster
export const CAPSULE_OUTCOMES = ["Ongoing", "Pass", "Fail", "Under Observation", "Under Exploration", "In Trial"];
export const AGE_RANGES = [
  "Age 00 to 04",
  "Age 05 to 12",
  "Age 13 to 17",
  "Age 18 to 24",
  "Age 25 to 35",
  "Age 36 to 50",
  "Age 51 to 65",
  "Age > 65",
  "Unknown",
];

// Pass/Fail thresholds per Capsule Type (default values)
export const DEFAULT_CAPSULE_THRESHOLDS = {
  "Capacity - Combined": {
    XEP: 0.7, XCFL: 0.7, XCPL: 0.7, XCTL: 0.7, XCOL: 0.7, XCP: 0.7, XBP: 0.7, MSIP: 0.45,
    "ΔPC1": 0, "ΔPC2": 0, "ΔPC3": 0, "ΔGEQ": 0, IC: 2, NDIV: 0.5,
  },
  "Capacity - Isolated": {
    XEP: 0.7, XFLL: 0.7, XFLR: 0.7, XPLL: 0.7, XPLR: 0.7, XTLL: 0.7, XTLR: 0.7, XOLL: 0.7, XOLR: 0.7,
    XCP: 0.7, XBP: 0.7, MSIP: 0.45, "ΔPC1": 0, "ΔPC2": 0, "ΔPC3": 0, "ΔGEQ": 0, IC: 2, NDIV: 0.5,
  },
};

export const CAPSULE_THRESHOLD_NAMES = {
  XEP: "Equivalent Proficiency",
  XCFL: "Combined Frontal Ratio",
  XCPL: "Combined Parietal Ratio",
  XCTL: "Combined Temporal Ratio",
  XCOL: "Combined Occipital Ratio",
  XFLL: "Frontal Lobe (L) Ratio",
  XFLR: "Frontal Lobe (R) Ratio",
  XPLL: "Parietal Lobe (L) Ratio",
  XPLR: "Parietal Lobe (R) Ratio",
  XTLL: "Temporal Lobe (L) Ratio",
  XTLR: "Temporal Lobe (R) Ratio",
  XOLL: "Occipital Lobe (L) Ratio",
  XOLR: "Occipital Lobe (R) Ratio",
  XCP: "Composite Proficiency",
  XBP: "Band Proficiency",
  MSIP: "Butler Interaction Proficiency",
  "ΔPC1": "Principal 1 Growth Differential",
  "ΔPC2": "Principal 2 Growth Differential",
  "ΔPC3": "Principal 3 Growth Differential",
  "ΔGEQ": "Equivalent Growth Differential",
  IC: "Interaction Class",
  NDIV: "Neuro-Divergence",
};

/** Fixed thresholds (not editable), same as IC on the unit side. */
export const LOCKED_THRESHOLDS = ["IC"];

/** Thresholds of a capsule record (values stored as columns, like units). */
export function thresholdsOf(capsule) {
  const defaults = DEFAULT_CAPSULE_THRESHOLDS[capsule?.capsuleType] || {};
  return Object.fromEntries(Object.keys(defaults).map((k) => {
    const v = capsule?.[k];
    return [k, v === undefined || v === null || v === "" ? defaults[k] : v];
  }));
}

// Assessment Block Manager (same period types as units; "Unit" → "Capsule" in the delivery texts)
export const CAPSULE_INDIRECT_DELIVERY = [
  "After Capsule Operations (MISC)",
  "Before Capsule Operations (MISC)",
  "Sensitivity or Exploratory Checking",
  "Pre-Employment",
];
export const CAPSULE_DIRECT_DELIVERY = [
  "During Capsule Operations (on-site)",
  "During Capsule Operations (practice)",
  "During Capsule Operations (remote)",
  "During Capsule Operations (training)",
];

// ---- Capsule Setup View (Capacity_Part4) ----
<<<<<<< HEAD
/** Clinical Markers CM1–CM100 (Yes/No fields of the Insert Scores form). */
=======
/** Clinical Markers CM1–CM100 (also used for the Neuro Markers NM1–NM100 Yes/No fields). */
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb
export const CLINICAL_MARKERS = [
  "Absence of Feeling",
  "Agitation/Hostility",
  "Autonomy Concerns",
  "Awareness Concerns",
  "Biting/Chewing",
  "Blurred Vision",
  "Cancer/Tumor Factor",
  "Concerns from Body Movement",
  "Concerns from Facial Expression",
  "Concerns from Medical Transfer",
  "Confusion or Denial State",
  "Cultural Concerns",
  "Daze or Brain Fog (Overload)",
  "Defect - Auditory",
  "Defect - Calculation/Numeracy",
  "Defect - Gustation",
  "Defect - Non-Verbal Reasoning",
  "Defect - Object Recognition",
  "Defect - Object Rotation",
  "Defect - Object Translation",
  "Defect - Olfaction",
  "Defect - Sequencing",
  "Defect - Symbols/Numbers",
  "Defect - Touch",
  "Defect - Verbal Reasoning",
  "Defect - Visual",
  "Defect - Visuo-constructive",
  "Deficiency in Logic or Rationality",
  "Disorientation - Person",
  "Disorientation - Space Time",
  "Dissociation or Paranoia",
  "Dizziness",
  "Drowsiness/Fatigue",
  "Emotional Distress",
  "Episode - Seizure/Epilepsy",
  "Episode - Stroke",
  "Episode - Suicide",
  "Episode - Vomiting",
  "Evasive or Uncooperative",
  "Eye Motion to Verbal Stimuli",
  "Family Concerns",
  "Fell Unconscious",
  "Fever",
  "Fits/Tantrums",
  "Hallucinations Concerns",
  "Headaches/Migraines",
  "Hyperventilation/Breathing",
  "Illiteracy Concerns",
  "Impaired Judgment",
  "Impulsive Eye Motion",
  "Inappropriate Words",
  "Incomprehensible Sounds",
  "Irregular Speech Concerns",
  "Irritable crying",
  "Issues with Posture",
  "Loss of Consciousness",
  "Low Concentration (Distracted)",
  "Mentally Scattered",
  "Motor Performance Concerns",
  "Nausea",
  "No Verbal Response",
  "Paralysis",
  "Perception Concerns",
  "Personality/Mood Changes",
  "Physical Aggression",
  "Pregnancy Factor",
  "Pupillary Reflexes",
  "Remote Memory Loss",
  "Signs of Crisis",
  "Signs of Delusion",
  "Signs of Depression",
  "Signs of Exhaustion",
  "Signs of Fear or Anxiety",
  "Signs of Fragmentation",
  "Signs of Malnutrition",
  "Signs of Medical Negligence",
  "Signs of Retrogression",
  "Signs of Substance Abuse",
  "Signs of Tremors",
  "Sleep Deprived",
  "Slurred/Stuttered Speech",
  "Spatial Concerns",
  "Sudden Memory Loss",
  "Systemic Complications",
  "Temporary Blindness",
  "Unusual Item: Trigger",
  "Unusual Item: Mental Defect",
  "Unusual Item: Psychotic Break",
  "Custom Criteria #1",
  "Custom Criteria #2",
  "Custom Criteria #3",
  "Custom Criteria #4",
  "Custom Criteria #5",
  "Custom Criteria #6",
  "Custom Criteria #7",
  "Custom Criteria #8",
  "Custom Criteria #9",
  "Custom Criteria #10",
  "Custom Criteria #11",
  "Custom Criteria #12"
];

export const CAUSE_TYPES = ["ABI Over TBI", "Assault/Violence", "Auditory Exceedance", "Bereavement", "Blast/Explosion", "CNS Breakdown", "Disturbing Images/Flashbacks", "Flashes or Subliminal Cuts", "Genetics", "Hard Fall", "Heterogenous", "Impact Acceleration", "Impact Brain Apnea", "Impairment at Birth", "Inconclusive", "Inertial Acceleration", "Intoxicant/Chemical", "Mental Defect", "Neuro Illness/Disease", "Not Applicable", "Other", "Paranormal Experience", "Penetration/Projectile", "Recreation/Sports", "Repeated Impacts", "Self-Harm", "Shaking/Whiplash", "Struck Against", "Struck By", "Surgical Operation", "Traffic Incident", "Transplant Recipient", "Trauma from Battering", "Weight Drop Damage", "Severe Burns (Fire Damage)"];

export const CONDITION_TYPES = ["Agnosia", "Amnesia", "Arrhythmia", "Arterial Dissection", "Bleeding", "Brain Aneurysm", "Brain Cell Shrinkage", "Brain Expansion", "Brain Lesions", "Brain/Cranial Avulsion", "Brain/Cranial Deformity", "Broca Damage", "Bruising", "Cerebellar Decay", "Cerebral Compression", "Cerebral Palsy", "Chronic Migraines", "Circle of Willis Damage", "Clinical Psychosis", "Concussion", "Degeneration", "Delirium", "Dementia", "Depression", "Diffuse - General", "Epilepsy/Seizures", "Fat Embolism", "Focal - General", "Frailty", "General Disorder/Syndrome", "Hematoma/Contusion", "Hemorrhage", "Inconclusive", "Inflammation", "Intracranial Herniation", "Intracranial Pressure", "Light Sensitivity", "Memory Loss (Short-Term)", "Midline Shift/Mass Effect", "Multiple Sclerosis", "Nerve Damage", "Nerve Disorder", "Neuro Lacerations/Contusions", "Neurological Deficit", "Neuroma/Cyst", "Neuromuscular", "Neuropathy", "Not Applicable", "Oedema", "Other", "Pituitary Infarction", "Polypharmacy", "Polytrauma", "PTSD", "Rare Disease", "Relevant Infection", "Sensory Disability", "Severe Mental Defect", "Skull Fractures", "Stroke", "Swelling", "Traumatic Axonal", "Usual Symptoms", "Vision Loss - Permanent", "Vision Loss - Sudden", "Vision Loss - Temporary", "Wernicke Damage"];

export const SEVERITY_LEVELS = ["Minor", "Mild", "Moderate", "Severe", "Major", "Not Applicable"];

export const SCAN_TYPES = ["Biomarker Accumulation", "Computed Tomography (CT)", "Diffusion-Tensor Imaging (DTI)", "Diffusion-Weighted Imaging (DWI)", "Experimental", "FLAIR or T1/T2", "Functional MRI", "Functional MRI - Normal", "Functional MRI - Resting State", "Functional Near-Infrared. (fNIRS)", "General Scan", "Innovative Imaging - Acute", "Innovative Imaging - Subacute", "Magnetic Resonance Imaging (MRI)", "Not Applicable", "Other", "Positron Emission Tomography (PET)", "Remote Technologies", "SPECT/Xe-CT", "Susceptibility Weighted Imaging (SWI)"];

export const MONITOR_TYPES = ["Brain Chemistry", "Cerebral Blood Flow", "Cerebral Oxygenation", "Cerebrospinal Comp Reserve", "Confirmatory Testing", "Decision on Capacity", "Diagnostic", "Electrophysiology", "Epidural Probe", "Experimental", "Innovative - CCP", "Innovative - ICP", "Intraparenchymal Probe", "Intraventricular Catheter", "Lumbar CSF Manometer", "Microdialysis", "Non-Invasive", "Not Applicable", "Not Specified", "Other Wave–Derived Indices", "Pressure Reactivity Index (PRx)", "Reconstruction", "Return to Play", "Routine - Advanced", "Routine - Basic", "Subarachnoid Probe", "Target-Directed", "Invasive Monitoring", "Transcranial Doppler (TCD)", "Electroencephalography (EEG)", "Magnetoencephalography (MEG)"];

export const THERAPY_TYPES = ["Body Positioning (Neuro)", "CPP Target", "Decompression", "Drug-Induced", "Experimental", "First-Line & Nutrition", "Hypothermia/Cooling", "Innovative", "Lund Protocol", "Mechanical", "Mediation", "Not Applicable", "Occupational Therapy", "Osmotic", "Other", "Per Intervention", "Per Investigation", "Physiotherapy", "Rehabilitation", "Respiratory Care", "Rest Period/Isolation", "Special Protocol", "Speech/Language Therapy", "Surgical Management"];

<<<<<<< HEAD
/** Clinical Marker fields CM1–CM100 on the Insert Scores form: Yes/No, default "No". */
export const CUSTOM_MARKER_MAX_LENGTH = 30;
export const NEURO_MARKER_COUNT = 100;
export const nmLabel = (i) => `CM${i} (${CLINICAL_MARKERS[i - 1]})`;
=======
/** Neuro Marker fields NM1–NM100 on the Insert Scores form: Yes/No, default "No". */
export const NEURO_MARKER_COUNT = 100;
export const nmLabel = (i) => `NM${i} (${CLINICAL_MARKERS[i - 1]})`;
>>>>>>> 6db65c5a0aa5a45f11f514bbcc0876178d12f9cb

/**
 * Capacities per Capsule Type (Capacity_Part4 / Part5).
 * code = suffix used for the bin totals (A<code> attained, M<code> maximum) and the X<code> ratio.
 */
export const CAPACITIES = {
  "Capacity - Combined": [
    { name: "Frontal", code: "CFL" },
    { name: "Parietal", code: "CPL" },
    { name: "Temporal", code: "CTL" },
    { name: "Occipital", code: "COL" },
  ],
  "Capacity - Isolated": [
    { name: "Frontal Lobe (L)", code: "FLL" },
    { name: "Frontal Lobe (R)", code: "FLR" },
    { name: "Parietal Lobe (L)", code: "PLL" },
    { name: "Parietal Lobe (R)", code: "PLR" },
    { name: "Temporal Lobe (L)", code: "TLL" },
    { name: "Temporal Lobe (R)", code: "TLR" },
    { name: "Occipital Lobe (L)", code: "OLL" },
    { name: "Occipital Lobe (R)", code: "OLR" },
  ],
};
export const capacitiesOf = (capsuleType) => CAPACITIES[capsuleType] || [];

/** Same option lists as the unit Insert Scores form. */
export const ENGAGE_LEVELS = ["High", "Medium", "Low", "N/A"];

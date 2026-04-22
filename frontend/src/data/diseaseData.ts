// Static disease progression data — what happens if untreated
// and symptom-keyword → disease mapping for voice detection

export interface ProgressionStage {
  stage: number;
  label: string;
  day_range: string;
  symptoms: string[];
  mortality_pct: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  color: string;
}

export interface DiseaseProgression {
  disease: string;
  stages: ProgressionStage[];
  care_tips?: string[]; // for Healthy Fish
}

export const DISEASE_PROGRESSIONS: Record<string, DiseaseProgression> = {
  'Healthy Fish': {
    disease: 'Healthy Fish',
    care_tips: [
      'Test water pH weekly — target 7.0–8.5 for most freshwater species',
      'Feed high-quality pellets twice daily, avoid overfeeding',
      'Quarantine all new fish for 14 days before adding to main pond',
      'Keep dissolved oxygen above 5 mg/L — add aerators if needed',
      'Clean pond banks monthly and remove dead vegetation',
      'Monitor ammonia and nitrite levels — both should be near 0 ppm',
    ],
    stages: [],
  },
  'Bacterial Red Disease': {
    disease: 'Bacterial Red Disease',
    stages: [
      { stage: 1, label: 'Early Infection', day_range: 'Day 1–3', symptoms: ['Small red patches on skin', 'Slight fin damage', 'Reduced appetite'], mortality_pct: 5, risk: 'Low', color: '#F59E0B' },
      { stage: 2, label: 'Active Spread',   day_range: 'Day 4–8', symptoms: ['Haemorrhagic ulcers on body', 'Fish moving erratically', 'Visible skin erosion', 'Loss of scales'], mortality_pct: 35, risk: 'High', color: '#F97316' },
      { stage: 3, label: 'Critical Stage',  day_range: 'Day 9+',  symptoms: ['Septicaemia (blood infection)', 'Internal organ failure', 'Mass die-off begins', 'Spreading to entire pond'], mortality_pct: 80, risk: 'Critical', color: '#DC2626' },
    ],
  },
  'Bacterial diseases - Aeromoniasis': {
    disease: 'Bacterial diseases - Aeromoniasis',
    stages: [
      { stage: 1, label: 'Initial Signs',   day_range: 'Day 1–2', symptoms: ['Skin discolouration', 'Minor haemorrhage spots', 'Listless swimming'], mortality_pct: 8, risk: 'Low', color: '#F59E0B' },
      { stage: 2, label: 'Ulcer Formation', day_range: 'Day 3–7', symptoms: ['Open ulcers on abdomen', 'Bloating and dropsy', 'Eye protrusion (exophthalmia)', 'Bloody discharge'], mortality_pct: 45, risk: 'High', color: '#F97316' },
      { stage: 3, label: 'Systemic Failure',day_range: 'Day 8+',  symptoms: ['Kidney and liver failure', 'Complete loss of scale', 'Uncontrolled haemorrhage', 'Rapid mass mortality'], mortality_pct: 85, risk: 'Critical', color: '#DC2626' },
    ],
  },
  'Fungal diseases Saprolegniasis': {
    disease: 'Fungal diseases Saprolegniasis',
    stages: [
      { stage: 1, label: 'Fungal Spores',   day_range: 'Day 1–4', symptoms: ['White cotton-like patches', 'Localised to one area', 'Mild lethargy'], mortality_pct: 3, risk: 'Low', color: '#F59E0B' },
      { stage: 2, label: 'Mycelium Growth', day_range: 'Day 5–10', symptoms: ['Fungal mat spreading', 'Skin tissue dying under fungus', 'Loss of colour and appetite', 'Scratching against surfaces'], mortality_pct: 30, risk: 'Medium', color: '#F97316' },
      { stage: 3, label: 'Secondary Infection', day_range: 'Day 11+', symptoms: ['Bacterial co-infection', 'Entire body covered', 'Organ stress', 'Unable to swim properly'], mortality_pct: 60, risk: 'Critical', color: '#DC2626' },
    ],
  },
  'Parasitic diseases': {
    disease: 'Parasitic diseases',
    stages: [
      { stage: 1, label: 'Parasite Attach', day_range: 'Day 1–3', symptoms: ['Flashing (rubbing on surfaces)', 'Small white dots on skin', 'Increased mucus production'], mortality_pct: 5, risk: 'Low', color: '#F59E0B' },
      { stage: 2, label: 'Heavy Infestation',day_range: 'Day 4–9', symptoms: ['Gill damage — laboured breathing', 'Visible parasites on scales', 'Severe weight loss', 'Congregating near surface'], mortality_pct: 40, risk: 'High', color: '#F97316' },
      { stage: 3, label: 'Host Collapse',    day_range: 'Day 10+', symptoms: ['Complete gill destruction', 'Paralysis and loss of balance', 'Widespread pond infection', 'Cascading secondary diseases'], mortality_pct: 70, risk: 'Critical', color: '#DC2626' },
    ],
  },
  'Viral diseases White tail disease': {
    disease: 'Viral diseases White tail disease',
    stages: [
      { stage: 1, label: 'Early Viral Load', day_range: 'Day 1–2', symptoms: ['White or pale tail fin', 'Reduced feeding', 'Fish separating from group'], mortality_pct: 10, risk: 'Medium', color: '#F59E0B' },
      { stage: 2, label: 'Necrosis Onset',   day_range: 'Day 3–6', symptoms: ['Muscle necrosis spreading to body', 'White patches extending forward', 'Convulsions', 'Inability to swim upright'], mortality_pct: 55, risk: 'High', color: '#F97316' },
      { stage: 3, label: 'Pandemic Spread',  day_range: 'Day 7+',  symptoms: ['Virus in water column', 'Entire cohort affected', 'No effective antiviral treatment', '90%+ pond mortality'], mortality_pct: 90, risk: 'Critical', color: '#DC2626' },
    ],
  },
};

// Fuzzy disease key match
export function getDiseaseProgression(diseaseName: string): DiseaseProgression | null {
  const key = Object.keys(DISEASE_PROGRESSIONS).find(k =>
    k.toLowerCase().includes(diseaseName.toLowerCase().slice(0, 12)) ||
    diseaseName.toLowerCase().includes(k.toLowerCase().slice(0, 12))
  );
  return key ? DISEASE_PROGRESSIONS[key] : DISEASE_PROGRESSIONS['Bacterial Red Disease'];
}

// ── Voice symptom → disease mapper ──────────────────────────────────────────

export interface SymptomMatch {
  disease: string;
  confidence: number;
  severity: 'Safe' | 'Warning' | 'Critical';
  keywords: string[];
}

const SYMPTOM_MAP: { keywords: string[]; disease: string; severity: 'Safe' | 'Warning' | 'Critical' }[] = [
  { keywords: ['white spot', 'white dot', 'white patch', 'white mark', 'salt', 'ich', 'ick', 'cotton'],
    disease: 'Fungal diseases Saprolegniasis', severity: 'Warning' },
  { keywords: ['red', 'blood', 'bleeding', 'haemorrhage', 'hemorrhage', 'ulcer', 'sore', 'wound', 'red patch', 'red spot', 'lal', 'लाल'],
    disease: 'Bacterial Red Disease', severity: 'Critical' },
  { keywords: ['swollen', 'bloated', 'dropsy', 'pinecone', 'bulging eye', 'pop eye', 'exophthalmia'],
    disease: 'Bacterial diseases - Aeromoniasis', severity: 'Critical' },
  { keywords: ['scratching', 'rubbing', 'flashing', 'parasite', 'worm', 'lice', 'fluke', 'mucus', 'slimy'],
    disease: 'Parasitic diseases', severity: 'Warning' },
  { keywords: ['white tail', 'pale tail', 'white fin', 'muscle', 'convulsion', 'spinning', 'spiral', 'necrosis'],
    disease: 'Viral diseases White tail disease', severity: 'Critical' },
  { keywords: ['healthy', 'normal', 'fine', 'good', 'okay', 'active', 'eating well', 'swimming well'],
    disease: 'Healthy Fish', severity: 'Safe' },
  { keywords: ['not eating', 'no appetite', 'lazy', 'slow', 'sinking', 'floating', 'surface'],
    disease: 'Bacterial diseases - Aeromoniasis', severity: 'Warning' },
  { keywords: ['gill', 'breathing', 'gasping', 'suffocate', 'oxygen', 'surface breathing'],
    disease: 'Bacterial Gill Disease', severity: 'Critical' },
];

export function matchSymptomsToDisease(transcript: string): SymptomMatch {
  const lower = transcript.toLowerCase();
  const scores: Record<string, { score: number; matched: string[]; severity: 'Safe' | 'Warning' | 'Critical' }> = {};

  for (const entry of SYMPTOM_MAP) {
    const matched = entry.keywords.filter(kw => lower.includes(kw));
    if (matched.length > 0) {
      if (!scores[entry.disease]) scores[entry.disease] = { score: 0, matched: [], severity: entry.severity };
      scores[entry.disease].score += matched.length;
      scores[entry.disease].matched.push(...matched);
      if (entry.severity === 'Critical') scores[entry.disease].severity = 'Critical';
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  if (sorted.length === 0) {
    return { disease: 'Bacterial Red Disease', confidence: 0.55, severity: 'Warning', keywords: [] };
  }

  const [topDisease, topData] = sorted[0];
  const totalKeywords = SYMPTOM_MAP.find(e => e.disease === topDisease)?.keywords.length ?? 5;
  const confidence = Math.min(0.95, 0.55 + (topData.score / totalKeywords) * 0.4);

  return { disease: topDisease, confidence, severity: topData.severity, keywords: topData.matched };
}

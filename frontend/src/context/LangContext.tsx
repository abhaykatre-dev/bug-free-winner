import React, { createContext, useContext, useState } from 'react';

export type LangCode = 'en' | 'hi' | 'mr' | 'ta' | 'te';

export const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English',  native: 'English' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi',  native: 'मराठी' },
  { code: 'ta', label: 'Tamil',    native: 'தமிழ்' },
  { code: 'te', label: 'Telugu',   native: 'తెలుగు' },
];

// ── Full translation dictionary ──────────────────────────────────────────────
const DICT: Record<LangCode, Record<string, string>> = {
  en: {},
  hi: {
    // Nav
    'Dashboard':       'डैशबोर्ड',
    'Diagnostics':     'निदान',
    'Ponds':           'तालाब',
    'Disease Library': 'रोग संग्रह',
    'Vet Map':         'पशु चिकित्सक नक्शा',
    // Header actions
    'Switch Language': 'भाषा बदलें',
    'Help Center':     'सहायता केंद्र',
    'Settings':        'सेटिंग्स',
    'Sign Out':        'साइन आउट',
    'New Diagnosis':   'नया निदान',
    // Dashboard
    'Welcome back':    'वापस स्वागत है',
    'Total Scans':     'कुल स्कैन',
    'Critical Cases':  'गंभीर मामले',
    'Healthy Results': 'स्वस्थ परिणाम',
    'Avg Confidence':  'औसत विश्वास',
    'New Scan':        'नया स्कैन',
    'Refresh':         'ताज़ा करें',
    'Analysis History':'विश्लेषण इतिहास',
    'Select a diagnosis to view the full journey': 'पूरी यात्रा देखने के लिए निदान चुनें',
    'Regional Outbreak Risk':  'क्षेत्रीय प्रकोप जोखिम',
    'All time':        'सभी समय',
    'Need action':     'कार्रवाई जरूरी',
    'No disease found':'कोई रोग नहीं',
    'Model accuracy':  'मॉडल सटीकता',
    'What To Do':      'क्या करें',
    'What NOT To Do':  'क्या न करें',
    'Prescribed Medication': 'निर्धारित दवाएं',
    'Estimated Economic Impact': 'आर्थिक प्रभाव',
    // Result page
    'AI Confidence Breakdown': 'AI विश्वास विश्लेषण',
    'Diagnosis Summary':       'निदान सारांश',
    'Biological Cause':        'जैविक कारण',
    'Environmental Triggers':  'पर्यावरणीय कारण',
    'AI Reasoning':            'AI तर्क',
    'Recovery Timeline':       'उपचार समय-सारणी',
    'Medication Protocol':     'दवा प्रोटोकॉल',
    'Nearest Vet':             'निकटतम पशु चिकित्सक',
    'Emergency Care Plan':     'आपातकालीन देखभाल',
    'Economic Impact':         'आर्थिक प्रभाव',
    'Similar Cases':           'समान मामले',
    'Read Aloud':              'जोर से पढ़ें',
    'Alert & Export':          'अलर्ट और निर्यात',
    'Approve Plan':            'योजना अनुमोदित करें',
    'Stop':                    'रोकें',
    'Severity':                'गंभीरता',
    'Confidence':              'विश्वास',
    'Primary Treatment':       'प्राथमिक उपचार',
    'Dosage':                  'खुराक',
    'Frequency':               'आवृत्ति',
    'Duration':                'अवधि',
    'GPS MATCH':               'GPS मिलान',
    'Call':                    'कॉल',
    'All Vets':                'सभी पशु चिकित्सक',
    'Trust Level':             'विश्वास स्तर',
    'Consult a vet':           'पशु चिकित्सक से परामर्श करें',
    'Proceed with caution':    'सावधानी से आगे बढ़ें',
    'Safe to follow treatment':'उपचार सुरक्षित है',
    'Disease Progression':     'रोग प्रगति',
    'Without Treatment':       'उपचार के बिना',
    'Stage':                   'चरण',
    'Fish Health Score':       'मछली स्वास्थ्य स्कोर',
    'All Good':                'सब ठीक है',
    'Your fish appear healthy':'आपकी मछली स्वस्थ दिखती है',
    'Care Tips':               'देखभाल सुझाव',
    // Diagnostics
    'Run Analysis':            'विश्लेषण चलाएं',
    'Upload Image':            'छवि अपलोड करें',
    'Voice Symptom Check':     'आवाज लक्षण जांच',
    'Describe Symptoms':       'लक्षण बताएं',
    'Quick-Test Samples':      'त्वरित परीक्षण नमूने',
    'Start Recording':         'रिकॉर्डिंग शुरू करें',
    'Stop Recording':          'रिकॉर्डिंग बंद करें',
    'Analyzing symptoms':      'लक्षणों का विश्लेषण',
    // Ponds
    'Pond Management':         'तालाब प्रबंधन',
    'Add Pond':                'तालाब जोड़ें',
    'Critical':                'गंभीर',
    'Warning':                 'चेतावनी',
    'Healthy':                 'स्वस्थ',
    'Scan Now':                'अभी स्कैन करें',
    'History':                 'इतिहास',
    'Risk':                    'जोखिम',
    'Disease Risk':            'रोग जोखिम',
    // Outbreak
    'Outbreak Prediction':     'प्रकोप भविष्यवाणी',
    'High Risk':               'उच्च जोखिम',
    'Medium Risk':             'मध्यम जोखिम',
    'Low Risk':                'कम जोखिम',
    'Next 3–5 days':           'अगले 3–5 दिन',
    'LIVE':                    'लाइव',
    // Login
    'Sign In':                 'साइन इन',
    'Register':                'पंजीकरण',
    'Continue with Google':    'Google से जारी रखें',
    'Full Name':               'पूरा नाम',
    'Email address':           'ईमेल पता',
    'Password':                'पासवर्ड',
    'Create Account':          'खाता बनाएं',
    // Offline
    'Offline Mode':            'ऑफलाइन मोड',
    'Online':                  'ऑनलाइन',
    'Limited Features':        'सीमित सुविधाएं',
    // Library
    // Library
    'Search diseases':         'रोग खोजें',
    // Status
    'STABLE':   'स्थिर',
    'OPTIMAL':  'इष्टतम',
    'WARNING':  'चेतावनी',
    'LIVE MONITORING': 'लाइव निगरानी',
    'LOADING':  'लोड हो रहा है',
    'No records': 'कोई रिकॉर्ड नहीं',
    'records':    'रिकॉर्ड',
  },
  mr: {
    'Dashboard':       'डॅशबोर्ड',
    'Diagnostics':     'निदान',
    'Ponds':           'तलाव',
    'Disease Library': 'रोग संग्रह',
    'Vet Map':         'पशुवैद्य नकाशा',
    'Sign Out':        'साइन आउट',
    'New Scan':        'नवे स्कॅन',
    'Refresh':         'ताजे करा',
    'Total Scans':     'एकूण स्कॅन',
    'Critical Cases':  'गंभीर प्रकरणे',
    'Healthy Results': 'निरोगी परिणाम',
    'Avg Confidence':  'सरासरी विश्वास',
    'Analysis History':'विश्लेषण इतिहास',
    'What To Do':      'काय करावे',
    'What NOT To Do':  'काय करू नये',
    'Run Analysis':    'विश्लेषण चालवा',
    'Scan Now':        'आता स्कॅन करा',
    'History':         'इतिहास',
    'All Good':        'सर्व ठीक',
    'Care Tips':       'काळजी टिप्स',
    'Emergency Care Plan': 'आपत्कालीन काळजी योजना',
    'Outbreak Prediction': 'उद्रेक अंदाज',
    'Trust Level':         'विश्वास स्तर',
    'Offline Mode':    'ऑफलाइन मोड',
    'Online':          'ऑनलाइन',
  },
  ta: {
    'Dashboard':       'டாஷ்போர்ட்',
    'Diagnostics':     'நோய் கண்டறிதல்',
    'Ponds':           'குளங்கள்',
    'Disease Library': 'நோய் நூலகம்',
    'Vet Map':         'கால்நடை மருத்துவர் வரைபடம்',
    'Sign Out':        'வெளியேறு',
    'New Scan':        'புதிய ஸ்கேன்',
    'Total Scans':     'மொத்த ஸ்கேன்கள்',
    'Critical Cases':  'தீவிர வழக்குகள்',
    'Healthy Results': 'ஆரோக்கியமான முடிவுகள்',
    'All Good':        'அனைத்தும் நன்றாக உள்ளது',
    'Emergency Care Plan': 'அவசர கவனிப்பு திட்டம்',
    'Outbreak Prediction': 'நோய் பரவல் கணிப்பு',
    'Offline Mode':    'ஆஃப்லைன் பயன்முறை',
  },
  te: {
    'Dashboard':       'డాష్‌బోర్డ్',
    'Diagnostics':     'రోగ నిర్ధారణ',
    'Ponds':           'చెరువులు',
    'Disease Library': 'వ్యాధి లైబ్రరీ',
    'Vet Map':         'పశువైద్య మ్యాప్',
    'Sign Out':        'సైన్ అవుట్',
    'New Scan':        'కొత్త స్కాన్',
    'Total Scans':     'మొత్తం స్కాన్లు',
    'Critical Cases':  'క్లిష్టమైన కేసులు',
    'Healthy Results': 'ఆరోగ్యకరమైన ఫలితాలు',
    'All Good':        'అన్నీ సరిగ్గా ఉన్నాయి',
    'Emergency Care Plan': 'అత్యవసర సంరక్షణ ప్రణాళిక',
    'Outbreak Prediction': 'వ్యాప్తి అంచనా',
    'Offline Mode':    'ఆఫ్‌లైన్ మోడ్',
  },
};

interface LangContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'en', setLang: () => {},
  t: (k) => k,
});

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LangCode>(
    () => (localStorage.getItem('aquadetect_lang') as LangCode) || 'en'
  );
  const setLang = (l: LangCode) => {
    setLangState(l);
    localStorage.setItem('aquadetect_lang', l);
  };
  // Translation function — falls back to key if not found
  const t = (key: string): string => {
    if (lang === 'en') return key;
    return DICT[lang]?.[key] ?? DICT['hi']?.[key] ?? key;
  };
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

export interface DiseaseKnowledge {
  id: string;
  cropKey: string;
  diseaseKey: string;
  isHealthy?: boolean;
  symptomsKeys: string[];
  organicTreatmentKeys: { title: string; desc: string; icon: string }[];
  preventionKeys: { title: string; desc: string; icon: string }[];
  chemicalFallbackKeys: { title: string; desc: string; precautions: string };
  sampleImageUrl: string;
  defaultConfidence: number;
}

export interface ScanResult {
  id: string;
  crop: string;
  cropKey: string;
  disease: string;
  diseaseKey: string;
  confidence: number;
  confidenceTier: 'high' | 'moderate' | 'low';
  isHealthy: boolean;
  imageUri: string;
  timestamp: number;
  symptoms: string[];
  organicTreatments: { title: string; desc: string; icon: string }[];
  prevention: { title: string; desc: string; icon: string }[];
  chemicalFallback: { title: string; desc: string; precautions: string };
  imageQualityNotice?: string;
  aiExplanation?: string;
  modelName?: string;
}

export type SupportedLanguage = 
  | 'en' // English (Default)
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'hi' // Hindi
  | 'mr' // Marathi
  | 'bn' // Bengali
  | 'gu' // Gujarati
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'as'; // Assamese

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  voiceLangCode: string;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export interface FarmerProfile {
  farmerId: string;       // e.g. "TN-FARM-8291"
  username: string;       // Chosen username for login
  password: string;       // Chosen password for login
  name: string;           // Farmer's name
  phone: string;          // 10-digit mobile number
  state: string;          // State / Region (e.g. Tamil Nadu, Karnataka, Andhra Pradesh, etc.)
  district?: string;      // District / Taluk
  primaryCrop?: string;   // Main crop grown (Banana, Paddy, Tomato, etc.)
  createdAt: number;      // Registration timestamp
}

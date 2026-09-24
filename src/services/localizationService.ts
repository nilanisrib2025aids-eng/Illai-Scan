import en from '../locales/en.json';
import ta from '../locales/ta.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import type { SupportedLanguage, LanguageMeta } from '../types';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', voiceLangCode: 'en-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceLangCode: 'ta-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voiceLangCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceLangCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voiceLangCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', voiceLangCode: 'ml-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', voiceLangCode: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', voiceLangCode: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', voiceLangCode: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', voiceLangCode: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', voiceLangCode: 'or-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', voiceLangCode: 'as-IN' }
];

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en,
  ta,
  hi,
  te,
  kn,
  ml,
  mr: hi,
  bn: en,
  gu: hi,
  pa: hi,
  or: hi,
  as: en
};

export class LocalizationService {
  private currentLanguage: SupportedLanguage = 'en'; // STRICT REQUIREMENT: Default = English ONLY
  private listeners: Array<(lang: SupportedLanguage) => void> = [];

  constructor() {
    const saved = localStorage.getItem('ilai_scan_lang') as SupportedLanguage;
    if (saved && translations[saved]) {
      this.currentLanguage = saved;
    } else {
      this.currentLanguage = 'en';
    }
  }

  public getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  public setLanguage(lang: SupportedLanguage): void {
    if (this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      localStorage.setItem('ilai_scan_lang', lang);
      this.notifyListeners();
    }
  }

  public t(key: string, defaultVal?: string): string {
    const langDict = translations[this.currentLanguage] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    // Fallback strictly to English dictionary if key is missing in regional dictionary
    if (translations.en[key]) {
      return translations.en[key];
    }
    return defaultVal || key;
  }

  public getVoiceLangCode(): string {
    const meta = SUPPORTED_LANGUAGES.find(l => l.code === this.currentLanguage);
    return meta ? meta.voiceLangCode : 'en-IN';
  }

  public subscribe(listener: (lang: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => fn(this.currentLanguage));
  }
}

export const localization = new LocalizationService();

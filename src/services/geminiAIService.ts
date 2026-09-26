import type { ScanResult } from '../types';
import { localization } from './localizationService';

const GEMINI_API_KEY_STORAGE = 'ilai_scan_gemini_api_key';

const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest'
];

export class GeminiAIService {
  public getApiKey(): string | null {
    const local = localStorage.getItem(GEMINI_API_KEY_STORAGE);
    if (local && local.trim()) return local.trim();

    if (import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }

    return null;
  }

  public setApiKey(key: string): void {
    if (key && key.trim()) {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    }
  }

  public hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  public async analyzeLeafWithVision(
    imageBase64OrUrl: string,
    selectedCropKey?: string
  ): Promise<ScanResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('MISSING_API_KEY');
    }

    const langCode = localization.getLanguage();
    const languageNames: Record<string, string> = {
      ta: 'Tamil (தமிழ்) - strictly write all crop names, disease names, symptoms, treatments, preventions, and explanations in Tamil script',
      hi: 'Hindi (हिन्दी) - strictly write all crop names, disease names, symptoms, treatments, preventions, and explanations in Hindi (Devanagari) script',
      te: 'Telugu (తెలుగు) - strictly write all crop names, disease names, symptoms, treatments, preventions, and explanations in Telugu script',
      kn: 'Kannada (ಕನ್ನಡ) - strictly write all crop names, disease names, symptoms, treatments, preventions, and explanations in Kannada script',
      ml: 'Malayalam (മലയാളം) - strictly write all crop names, disease names, symptoms, treatments, preventions, and explanations in Malayalam script',
      mr: 'Marathi (मराठी) - strictly write all content in Marathi script',
      bn: 'Bengali (বাংলা) - strictly write all content in Bengali script',
      gu: 'Gujarati (ગુજરાતી) - strictly write all content in Gujarati script',
      pa: 'Punjabi (ਪੰਜਾਬੀ) - strictly write all content in Punjabi (Gurmukhi) script',
      or: 'Odia (ଓଡ଼ିଆ) - strictly write all content in Odia script',
      as: 'Assamese (অসমীয়া) - strictly write all content in Assamese script',
      en: 'English - write all content clearly in English'
    };
    const targetLanguage = languageNames[langCode] || 'the farmer\'s selected language';

    let mimeType = 'image/jpeg';
    let base64Data = imageBase64OrUrl;

    if (imageBase64OrUrl.startsWith('data:')) {
      const matches = imageBase64OrUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    } else if (imageBase64OrUrl.startsWith('http')) {
      const resp = await fetch(imageBase64OrUrl);
      const blob = await resp.blob();
      mimeType = blob.type || 'image/jpeg';
      const buffer = await blob.arrayBuffer();
      base64Data = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
    }

    const prompt = `You are an expert plant pathologist and agronomist assisting Indian farmers.
Look closely at this plant leaf image.

CRITICAL LANGUAGE INSTRUCTION:
- You MUST generate ALL textual fields in ${targetLanguage}.
- Every single field ("crop", "disease", "symptoms", "title", "desc", "precautions") MUST be written completely and naturally in the farmer's selected language (${langCode !== 'en' ? targetLanguage : 'English'}).
- DO NOT mix English sentences or English descriptions into the output when the user selected a non-English language. You may keep standard scientific pathogen names in parentheses if helpful, but the disease title, symptoms, organic remedies, dosages, and prevention tips MUST be completely in the target language.

Task:
1. Identify the EXACT crop plant species (e.g. Banana/வாழை, Pumpkin/பூசணி, Tomato/தக்காளி, Rice/நெல், Potato/உருளை, Cotton/பருத்தி, Chilli/மிளகாய், Brinjal/கத்தரி, Papaya/பப்பாளி, Maize/மக்காச்சோளம், Mango/மாம்பழம், Citrus/எலுமிச்சை, or any specific plant shown). Look directly at the leaf structure, veins, margins, and texture.
2. Determine if the leaf is healthy or affected by a pest or pathogen (e.g. Sigatoka / இலைப்புள்ளி நோய், Early Blight, Late Blight, Powdery Mildew, Downy Mildew, Leaf Curl, Bacterial Spot, Rust, Anthracnose, Nutrient Deficiency, or Healthy Crop Leaf).
3. If healthy, set "isHealthy": true and write the disease name as Healthy Crop Leaf in the target language.
4. Provide actionable, low-cost organic solutions (Neem oil, Panchagavya, Trichoderma, Pseudomonas, wood ash, pruning) with exact practical dosages in the target language.

Respond strictly in valid JSON format matching this schema:
{
  "crop": "Crop Name in target language",
  "disease": "Disease Name in target language",
  "isHealthy": false,
  "confidence": 94,
  "symptoms": [
    "Symptom 1 in target language",
    "Symptom 2 in target language",
    "Symptom 3 in target language"
  ],
  "organicTreatments": [
    {
      "title": "Treatment Title in target language (e.g. சூடோமோனாஸ் தெளிப்பு / வேப்பெண்ணெய் கரைசல்)",
      "desc": "Step-by-step instructions with exact dosage (e.g. 1 லிட்டர் தண்ணீருக்கு 10 கிராம்) and spray timing in target language",
      "icon": "Scissors"
    }
  ],
  "prevention": [
    {
      "title": "Prevention Title in target language",
      "desc": "How to prevent this in the field in target language",
      "icon": "ShieldCheck"
    }
  ],
  "chemicalFallback": {
    "title": "Emergency chemical recommendation in target language",
    "desc": "Labeled chemical dosage per liter in target language",
    "precautions": "Safety gear warnings (gloves, mask) in target language"
  }
}
CRITICAL RULE: Respond ONLY with valid JSON. Do not include markdown preamble or conversational text outside JSON.`;

    let lastError: any = null;

    for (const model of GEMINI_MODELS) {
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data
                    }
                  },
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        });

        const data = await response.json();

        if (response.status === 429) {
          throw new Error('QUOTA_EXCEEDED');
        }

        if (data.error) {
          if (data.error.code === 400 || (data.error.message && data.error.message.includes('API key'))) {
            throw new Error('INVALID_API_KEY: ' + data.error.message);
          }
          if (data.error.code === 429) {
            throw new Error('QUOTA_EXCEEDED');
          }
          lastError = new Error(data.error.message || 'Gemini API Error');
          continue;
        }

        const candidate = data.candidates && data.candidates[0];
        const textPart = (candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text) || '';
        const jsonMatch = textPart.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          throw new Error('UNABLE_TO_PARSE_AI_RESPONSE');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        let confidence = parsed.confidence || 92;
        if (confidence < 1 && confidence > 0) {
          confidence = Math.round(confidence * 100);
        }
        confidence = Math.min(99, Math.max(65, confidence));

        let confidenceTier: 'high' | 'moderate' | 'low' = 'high';
        if (confidence < 70) confidenceTier = 'low';
        else if (confidence < 85) confidenceTier = 'moderate';

        const isHealthy = Boolean(parsed.isHealthy || (parsed.disease && parsed.disease.toLowerCase().includes('healthy')));
        const cropName = parsed.crop || (selectedCropKey ? localization.t(selectedCropKey) : 'Crop');
        const diseaseName = isHealthy ? localization.t('disease.healthy_leaf') : (parsed.disease || 'Detected Condition');

        const result: ScanResult = {
          id: 'gemini_scan_' + Date.now(),
          crop: cropName,
          cropKey: selectedCropKey || 'crop.detected',
          disease: diseaseName,
          diseaseKey: 'disease.gemini_custom',
          confidence,
          confidenceTier,
          isHealthy,
          imageUri: imageBase64OrUrl,
          timestamp: Date.now(),
          symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
          organicTreatments: Array.isArray(parsed.organicTreatments) && parsed.organicTreatments.length > 0
            ? parsed.organicTreatments.map((t: any) => ({
                title: t.title || localization.t('organic.healthy_t1_title'),
                desc: t.desc || localization.t('organic.healthy_t1_desc'),
                icon: t.icon || 'Scissors'
              }))
            : [
                {
                  title: localization.t('organic.healthy_t1_title'),
                  desc: localization.t('organic.healthy_t1_desc'),
                  icon: 'Scissors'
                }
              ],
          prevention: Array.isArray(parsed.prevention) && parsed.prevention.length > 0
            ? parsed.prevention.map((p: any) => ({
                title: p.title || localization.t('prevention.healthy_p1_title'),
                desc: p.desc || localization.t('prevention.healthy_p1_desc'),
                icon: p.icon || 'ShieldCheck'
              }))
            : [
                {
                  title: localization.t('prevention.healthy_p1_title'),
                  desc: localization.t('prevention.healthy_p1_desc'),
                  icon: 'ShieldCheck'
                }
              ],
          chemicalFallback: parsed.chemicalFallback && typeof parsed.chemicalFallback === 'object' && !Array.isArray(parsed.chemicalFallback)
            ? {
                title: parsed.chemicalFallback.title || localization.t('chemical.healthy_none_title'),
                desc: parsed.chemicalFallback.desc || localization.t('chemical.healthy_none_desc'),
                precautions: parsed.chemicalFallback.precautions || localization.t('chemical.general_precautions')
              }
            : {
                title: localization.t('chemical.healthy_none_title'),
                desc: localization.t('chemical.healthy_none_desc'),
                precautions: localization.t('chemical.general_precautions')
              },
          aiExplanation: cropName + ': ' + diseaseName,
          modelName: 'Google Gemini Multimodal AI'
        };

        return result;
      } catch (err: any) {
        lastError = err;
        if (err.message === 'QUOTA_EXCEEDED' || (err.message && err.message.startsWith('INVALID_API_KEY'))) {
          throw err;
        }
      }
    }

    throw lastError || new Error('FAILED_TO_ANALYZE_IMAGE');
  }

  public async askAgriculturalAssistant(
    userQuestion: string,
    cropContext?: string,
    history?: { sender: 'user' | 'assistant'; text: string }[]
  ): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const langCode = localization.getLanguage();
    // Map language code to full language name and native script for authentic phrasing
    const languageNames: Record<string, string> = {
      ta: 'Tamil (தமிழ்) - speak in warm, respectful, natural Tamil phrasing used by farmers',
      hi: 'Hindi (हिन्दी) - speak in warm, respectful, natural Hindi phrasing used by farmers',
      te: 'Telugu (తెలుగు) - speak in warm, respectful, natural Telugu phrasing used by farmers',
      kn: 'Kannada (ಕನ್ನಡ) - speak in warm, respectful, natural Kannada phrasing used by farmers',
      ml: 'Malayalam (മലയാളം) - speak in warm, respectful, natural Malayalam phrasing used by farmers',
      mr: 'Marathi (मराठी) - speak in warm, respectful, natural Marathi phrasing',
      bn: 'Bengali (বাংলা) - speak in warm, respectful, natural Bengali phrasing',
      gu: 'Gujarati (ગુજરાતી) - speak in warm, respectful, natural Gujarati phrasing',
      pa: 'Punjabi (ਪੰਜਾਬੀ) - speak in warm, respectful, natural Punjabi phrasing',
      or: 'Odia (ଓଡ଼ିଆ) - speak in warm, respectful, natural Odia phrasing',
      as: 'Assamese (অসমীয়া) - speak in warm, respectful, natural Assamese phrasing',
      en: 'English - speak in warm, supportive, clear English suitable for Indian agriculture'
    };
    const targetLanguage = languageNames[langCode] || 'the farmer\'s selected language';

    const systemInstruction = 
      `You are the 'ILAI SCAN' AI Agricultural Companion & Expert Agronomist ("விவசாயி வழிகாட்டி" / "किसान मित्र").\n` +
      `You are having a direct conversation with a hard-working farmer. Always respond like an empathetic, highly knowledgeable, and practical human agricultural officer.\n` +
      `CRITICAL LANGUAGE REQUIREMENT: You MUST answer strictly and completely in ${targetLanguage}. Do not default to English unless the user's selected language is English.\n` +
      `FARMER CONTEXT:\n` +
      `- Active Crop Context: ${cropContext ? cropContext : 'General field crop / garden'}\n` +
      `BEHAVIOR & TONE RULES:\n` +
      `1. Directly and specifically answer whatever the user asks. If the user asks a greeting (e.g., "How are you?", "வணக்கம்", "नमस्ते"), warmly greet them back as their agricultural companion and ask how their crops or fields are doing.\n` +
      `2. If they ask about a specific crop, symptom, pest, fertilizer, or farming practice, answer that exact topic with accurate, practical advice.\n` +
      `3. Give practical, immediately actionable advice: exact dosage (e.g., 5ml neem oil per liter water, 30ml Panchagavya per liter), optimal spray timing (early morning or late evening), and field sanitation.\n` +
      `4. Prioritize natural, organic, and low-cost eco-friendly remedies (Neem oil, Panchagavya, Jeevamrutha, Trichoderma viride, Beauveria bassiana, yellow sticky traps, light traps, cow urine spray, wood ash).\n` +
      `5. If chemical controls are mentioned, advise them only as a secondary emergency resort and always emphasize protective masks, gloves, and safe withholding periods before harvest.\n` +
      `6. Keep the formatting clean and readable: use short paragraphs, bullet points, or numbered steps so it is easy to read or listen to on a mobile screen.`;

    // Construct conversation history for Gemini API
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // System prompt included in the first turn or instruction context
    if (history && history.length > 0) {
      // Include past turns up to 6 recent messages
      const recentHistory = history.slice(-6);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Append current user question
    contents.push({
      role: 'user',
      parts: [
        {
          text: userQuestion
        }
      ]
    });

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const requestBody = {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[Gemini AI] Model ${model} returned HTTP ${response.status}:`, errData);
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } catch (e) {
        console.warn(`[Gemini AI] Model ${model} request error:`, e);
        continue;
      }
    }

    return null;
  }
}

export const geminiAIService = new GeminiAIService();

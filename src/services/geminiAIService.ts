import type { ScanResult } from '../types';
import { localization } from './localizationService';

const GEMINI_API_KEY_STORAGE = 'ilai_scan_gemini_api_key';

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
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

    const lang = localization.getLanguage();

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

    const prompt = `You are an expert plant pathologist and agronomist for farmers.
Look closely at this plant leaf image.
Task:
1. Identify the EXACT crop plant species (e.g. Pumpkin, Gourd, Banana, Tomato, Rice/Paddy, Potato, Cotton, Chilli, Brinjal, Papaya, Maize, Mango, Citrus, or any specific plant shown). Do NOT assume or default to any fixed crop. Look directly at the leaf structure, veins, margins, and texture.
2. Determine if the leaf is healthy or affected by a pest or pathogen (e.g. Early Blight, Late Blight, Powdery Mildew, Downy Mildew, Leaf Curl, Bacterial Spot, Rust, Anthracnose, Nutrient Deficiency, or Healthy Crop Leaf).
3. If healthy, set "isHealthy": true and "disease": "Healthy Crop Leaf".
4. Language for farmer response: ${lang}.
5. Provide actionable organic solutions as primary treatments.

Respond strictly in valid JSON format matching this schema:
{
  "crop": "Exact Crop Name",
  "disease": "Disease Name or Healthy Crop Leaf",
  "isHealthy": true,
  "confidence": 94,
  "symptoms": [
    "Clear symptom observed on this leaf"
  ],
  "organicTreatments": [
    {
      "title": "Clear organic action (e.g. Neem seed kernel extract, Panchagavya, Trichoderma viride, pruning)",
      "desc": "Step-by-step instructions with dosage and application timing",
      "icon": "Scissors"
    }
  ],
  "prevention": [
    {
      "title": "Field prevention practice",
      "desc": "How to prevent this issue in the field",
      "icon": "ShieldCheck"
    }
  ],
  "chemicalFallback": {
    "title": "Emergency chemical recommendation (SECONDARY OPTION ONLY)",
    "desc": "Recommended labeled fungicide/insecticide dosage per liter",
    "precautions": "Mandatory safety gear (rubber gloves, mask), avoid water bodies."
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
          organicTreatments: Array.isArray(parsed.organicTreatments)
            ? parsed.organicTreatments.map((t: any) => ({
                title: t.title || 'Organic Treatment',
                desc: t.desc || '',
                icon: t.icon || 'Scissors'
              }))
            : [
                {
                  title: 'Natural Plant Health Care',
                  desc: 'Spray cold-pressed neem oil (5ml/L) or fermented Panchagavya (30ml/L) in the early morning.',
                  icon: 'Scissors'
                }
              ],
          prevention: Array.isArray(parsed.prevention)
            ? parsed.prevention.map((p: any) => ({
                title: p.title || 'Field Prevention',
                desc: p.desc || '',
                icon: p.icon || 'ShieldCheck'
              }))
            : [
                {
                  title: 'Field Sanitation & Crop Care',
                  desc: 'Maintain clean field borders, proper spacing, and monitor leaves weekly.',
                  icon: 'ShieldCheck'
                }
              ],
          chemicalFallback: parsed.chemicalFallback && typeof parsed.chemicalFallback === 'object' && !Array.isArray(parsed.chemicalFallback)
            ? {
                title: parsed.chemicalFallback.title || 'Consult Local Agricultural Officer',
                desc: parsed.chemicalFallback.desc || 'Use approved agrochemicals only as a secondary emergency recourse.',
                precautions: parsed.chemicalFallback.precautions || 'Wear safety mask and gloves during application.'
              }
            : {
                title: 'Consult Local Agronomist (Emergency Fallback)',
                desc: 'Use registered plant protection chemicals only under expert guidance.',
                precautions: 'Wear protective mask and gloves.'
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
    cropContext?: string
  ): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    const lang = localization.getLanguage();
    const systemPrompt = "You are 'ILAI SCAN' Agricultural Assistant, a warm, practical, knowledgeable advisor for Indian farmers.\nLanguage: Answer directly in '" + lang + "'.\nContext: " + (cropContext ? 'Current crop: ' + cropContext : 'General agriculture') + "\nRules:\n1. Focus on organic, low-cost remedies (Neem oil, Panchagavya, Jeevamrutha, Trichoderma, wood ash, companion plants).\n2. Never recommend hazardous chemical pesticides unless specifically requested, and always include safety warnings.\n3. Keep answers clear, concise, and easy to follow for farmers.";

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
                  { text: systemPrompt + '\n\nFarmer Question: ' + userQuestion }
                ]
              }
            ]
          })
        });

        const data = await response.json();
        const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
        if (text) return text;
      } catch {
        continue;
      }
    }

    return null;
  }
}

export const geminiAIService = new GeminiAIService();

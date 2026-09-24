import type { ScanResult } from '../types';
import { AGRICULTURAL_DISEASE_DB } from '../data/agriculturalDb';
import { localization } from './localizationService';
import { geminiAIService } from './geminiAIService';

export interface IDiseaseDetectionService {
  name: string;
  analyzeImage(
    imageDataUrl: string,
    forcedCropKey?: string,
    targetDiseaseId?: string
  ): Promise<ScanResult>;
}

/**
 * Gemini AI Agricultural Vision Service.
 * Uses Google Gemini Multimodal Vision AI to accurately detect the real crop and disease directly from leaf pixels.
 * No heuristic ML fallback model.
 */
export class GeminiVisionDiseaseDetectionService implements IDiseaseDetectionService {
  public readonly name = 'Google Gemini Vision AI';

  public async analyzeImage(
    imageDataUrl: string,
    forcedCropKey?: string,
    targetDiseaseId?: string
  ): Promise<ScanResult> {
    // 1. If preset sample was tapped from demo library, retrieve the reference sample data
    if (targetDiseaseId) {
      const match = AGRICULTURAL_DISEASE_DB.find((d) => d.id === targetDiseaseId);
      if (match) {
        return this.formatSampleResult(match, imageDataUrl);
      }
    }

    // 2. Validate that an image is provided
    if (!imageDataUrl) {
      throw new Error('NO_IMAGE_PROVIDED');
    }

    // 3. Leaf & Plant Quality / Relevance Check
    const { imageQualityService } = await import('./imageQualityService');
    const quality = await imageQualityService.analyzeQuality(imageDataUrl);
    if (quality.isNotPlant) {
      throw new Error('IRRELEVANT_IMAGE_NOT_A_PLANT');
    }

    // 4. Verify Gemini API Key configuration
    if (!geminiAIService.hasApiKey()) {
      throw new Error('MISSING_API_KEY');
    }

    // 5. Run real Google Gemini Vision AI Multimodal Diagnosis
    // This directly recognizes the true crop (Pumpkin, Banana, Tomato, Rice, Potato, etc.) and true condition.
    return await geminiAIService.analyzeLeafWithVision(imageDataUrl, forcedCropKey);
  }

  private formatSampleResult(diseaseData: typeof AGRICULTURAL_DISEASE_DB[0], imageDataUrl?: string): ScanResult {
    const cropName = localization.t(diseaseData.cropKey);
    const diseaseName = localization.t(diseaseData.diseaseKey);
    const confidence = diseaseData.defaultConfidence || 92;

    let confidenceTier: 'high' | 'moderate' | 'low' = 'high';
    if (confidence < 70) confidenceTier = 'low';
    else if (confidence < 85) confidenceTier = 'moderate';

    return {
      id: 'sample_' + Date.now(),
      crop: cropName,
      cropKey: diseaseData.cropKey,
      disease: diseaseName,
      diseaseKey: diseaseData.diseaseKey,
      confidence,
      confidenceTier,
      isHealthy: !!diseaseData.isHealthy,
      imageUri: imageDataUrl || diseaseData.sampleImageUrl,
      timestamp: Date.now(),
      symptoms: diseaseData.symptomsKeys.map((k) => localization.t(k)),
      organicTreatments: diseaseData.organicTreatmentKeys.map((item) => ({
        title: localization.t(item.title),
        desc: localization.t(item.desc),
        icon: item.icon
      })),
      prevention: diseaseData.preventionKeys.map((item) => ({
        title: localization.t(item.title),
        desc: localization.t(item.desc),
        icon: item.icon
      })),
      chemicalFallback: {
        title: localization.t(diseaseData.chemicalFallbackKeys.title),
        desc: localization.t(diseaseData.chemicalFallbackKeys.desc),
        precautions: localization.t(diseaseData.chemicalFallbackKeys.precautions)
      },
      aiExplanation: diseaseData.isHealthy
        ? localization.t('disease.healthy_leaf')
        : cropName + ' - ' + diseaseName,
      modelName: 'Agricultural Reference Standard'
    };
  }
}

export const diseaseDetectionService: IDiseaseDetectionService = new GeminiVisionDiseaseDetectionService();

import type { DiseaseKnowledge } from '../types';

export const CROPS_LIST = [
  { id: 'tomato', nameKey: 'crop.tomato', icon: '🍅' },
  { id: 'paddy', nameKey: 'crop.paddy', icon: '🌾' },
  { id: 'potato', nameKey: 'crop.potato', icon: '🥔' },
  { id: 'banana', nameKey: 'crop.banana', icon: '🍌' },
  { id: 'cotton', nameKey: 'crop.cotton', icon: '🌱' },
  { id: 'chilli', nameKey: 'crop.chilli', icon: '🌶️' },
  { id: 'brinjal', nameKey: 'crop.brinjal', icon: '🍆' },
  { id: 'groundnut', nameKey: 'crop.groundnut', icon: '🥜' },
  { id: 'sugarcane', nameKey: 'crop.sugarcane', icon: '🎋' },
  { id: 'maize', nameKey: 'crop.maize', icon: '🌽' },
  { id: 'mango', nameKey: 'crop.mango', icon: '🥭' },
  { id: 'grapes', nameKey: 'crop.grapes', icon: '🍇' }
];

export const AGRICULTURAL_DISEASE_DB: DiseaseKnowledge[] = [
  {
    id: 'tomato_early_blight',
    cropKey: 'crop.tomato',
    diseaseKey: 'disease.tomato_early_blight',
    isHealthy: false,
    defaultConfidence: 92,
    sampleImageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?auto=format&fit=crop&w=600&q=80',
    symptomsKeys: [
      'symptom.tomato_early_blight_1',
      'symptom.tomato_early_blight_2',
      'symptom.tomato_early_blight_3'
    ],
    organicTreatmentKeys: [
      {
        title: 'organic.tomato_early_blight_t1_title',
        desc: 'organic.tomato_early_blight_t1_desc',
        icon: 'Scissors'
      },
      {
        title: 'organic.tomato_early_blight_t2_title',
        desc: 'organic.tomato_early_blight_t2_desc',
        icon: 'Droplets'
      },
      {
        title: 'organic.tomato_early_blight_t3_title',
        desc: 'organic.tomato_early_blight_t3_desc',
        icon: 'Wind'
      }
    ],
    preventionKeys: [
      {
        title: 'prevention.tomato_early_blight_p1_title',
        desc: 'prevention.tomato_early_blight_p1_desc',
        icon: 'ShieldCheck'
      },
      {
        title: 'prevention.tomato_early_blight_p2_title',
        desc: 'prevention.tomato_early_blight_p2_desc',
        icon: 'Sun'
      }
    ],
    chemicalFallbackKeys: {
      title: 'chemical.tomato_early_blight_title',
      desc: 'chemical.tomato_early_blight_desc',
      precautions: 'chemical.general_precautions'
    }
  },
  {
    id: 'potato_late_blight',
    cropKey: 'crop.potato',
    diseaseKey: 'disease.potato_late_blight',
    isHealthy: false,
    defaultConfidence: 89,
    sampleImageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    symptomsKeys: [
      'symptom.potato_late_blight_1',
      'symptom.potato_late_blight_2',
      'symptom.potato_late_blight_3'
    ],
    organicTreatmentKeys: [
      {
        title: 'organic.potato_late_blight_t1_title',
        desc: 'organic.potato_late_blight_t1_desc',
        icon: 'Flame'
      },
      {
        title: 'organic.potato_late_blight_t2_title',
        desc: 'organic.potato_late_blight_t2_desc',
        icon: 'Sparkles'
      },
      {
        title: 'organic.potato_late_blight_t3_title',
        desc: 'organic.potato_late_blight_t3_desc',
        icon: 'Layers'
      }
    ],
    preventionKeys: [
      {
        title: 'prevention.potato_late_blight_p1_title',
        desc: 'prevention.potato_late_blight_p1_desc',
        icon: 'ShieldCheck'
      },
      {
        title: 'prevention.potato_late_blight_p2_title',
        desc: 'prevention.potato_late_blight_p2_desc',
        icon: 'Calendar'
      }
    ],
    chemicalFallbackKeys: {
      title: 'chemical.potato_late_blight_title',
      desc: 'chemical.potato_late_blight_desc',
      precautions: 'chemical.general_precautions'
    }
  },
  {
    id: 'paddy_blast',
    cropKey: 'crop.paddy',
    diseaseKey: 'disease.paddy_blast',
    isHealthy: false,
    defaultConfidence: 94,
    sampleImageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    symptomsKeys: [
      'symptom.paddy_blast_1',
      'symptom.paddy_blast_2',
      'symptom.paddy_blast_3'
    ],
    organicTreatmentKeys: [
      {
        title: 'organic.paddy_blast_t1_title',
        desc: 'organic.paddy_blast_t1_desc',
        icon: 'Droplets'
      },
      {
        title: 'organic.paddy_blast_t2_title',
        desc: 'organic.paddy_blast_t2_desc',
        icon: 'Layers'
      }
    ],
    preventionKeys: [
      {
        title: 'prevention.paddy_blast_p1_title',
        desc: 'prevention.paddy_blast_p1_desc',
        icon: 'ShieldCheck'
      },
      {
        title: 'prevention.paddy_blast_p2_title',
        desc: 'prevention.paddy_blast_p2_desc',
        icon: 'Droplets'
      }
    ],
    chemicalFallbackKeys: {
      title: 'chemical.paddy_blast_title',
      desc: 'chemical.paddy_blast_desc',
      precautions: 'chemical.general_precautions'
    }
  },
  {
    id: 'chilli_leaf_curl',
    cropKey: 'crop.chilli',
    diseaseKey: 'disease.chilli_leaf_curl',
    isHealthy: false,
    defaultConfidence: 88,
    sampleImageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
    symptomsKeys: [
      'symptom.chilli_leaf_curl_1',
      'symptom.chilli_leaf_curl_2',
      'symptom.chilli_leaf_curl_3'
    ],
    organicTreatmentKeys: [
      {
        title: 'organic.chilli_leaf_curl_t1_title',
        desc: 'organic.chilli_leaf_curl_t1_desc',
        icon: 'Droplets'
      },
      {
        title: 'organic.chilli_leaf_curl_t2_title',
        desc: 'organic.chilli_leaf_curl_t2_desc',
        icon: 'Sparkles'
      }
    ],
    preventionKeys: [
      {
        title: 'prevention.chilli_leaf_curl_p1_title',
        desc: 'prevention.chilli_leaf_curl_p1_desc',
        icon: 'ShieldCheck'
      }
    ],
    chemicalFallbackKeys: {
      title: 'chemical.chilli_leaf_curl_title',
      desc: 'chemical.chilli_leaf_curl_desc',
      precautions: 'chemical.general_precautions'
    }
  },
  {
    id: 'healthy_leaf',
    cropKey: 'crop.tomato',
    diseaseKey: 'disease.healthy_leaf',
    isHealthy: true,
    defaultConfidence: 96,
    sampleImageUrl: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80',
    symptomsKeys: [
      'symptom.healthy_1',
      'symptom.healthy_2',
      'symptom.healthy_3'
    ],
    organicTreatmentKeys: [
      {
        title: 'organic.healthy_t1_title',
        desc: 'organic.healthy_t1_desc',
        icon: 'Sparkles'
      },
      {
        title: 'organic.healthy_t2_title',
        desc: 'organic.healthy_t2_desc',
        icon: 'Droplets'
      }
    ],
    preventionKeys: [
      {
        title: 'prevention.healthy_p1_title',
        desc: 'prevention.healthy_p1_desc',
        icon: 'ShieldCheck'
      },
      {
        title: 'prevention.healthy_p2_title',
        desc: 'prevention.healthy_p2_desc',
        icon: 'Eye'
      }
    ],
    chemicalFallbackKeys: {
      title: 'chemical.healthy_none_title',
      desc: 'chemical.healthy_none_desc',
      precautions: 'chemical.general_precautions'
    }
  }
];

import type { ScanResult } from '../types';

const STORAGE_KEY = 'ilai_scan_history';

export class HistoryService {
  public getHistory(): ScanResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return this.getDefaultHistory();
  }

  public saveScan(scan: ScanResult): void {
    const list = this.getHistory();
    const updated = [scan, ...list.filter((item) => item.id !== scan.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  }

  public clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private getDefaultHistory(): ScanResult[] {
    return [
      {
        id: 'hist_1',
        crop: 'Tomato',
        cropKey: 'crop.tomato',
        disease: 'Early Blight',
        diseaseKey: 'disease.tomato_early_blight',
        confidence: 92,
        confidenceTier: 'high',
        isHealthy: false,
        imageUri:
          'https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?auto=format&fit=crop&w=600&q=80',
        timestamp: Date.now() - 3600000 * 2,
        symptoms: [
          'Dark brown concentric circular spots on older leaves',
          'Yellow halo around lesions'
        ],
        organicTreatments: [
          {
            title: 'Remove Affected Lower Leaves',
            desc: 'Prune infected lower foliage and bury away from crops.',
            icon: 'Scissors'
          }
        ],
        prevention: [
          {
            title: 'Practice Crop Rotation',
            desc: 'Avoid solanaceous crops in the same plot consecutively.',
            icon: 'ShieldCheck'
          }
        ],
        chemicalFallback: {
          title: 'Mancozeb 75% WP',
          desc: 'Apply at 2g/L only if organic methods fail under high pressure.',
          precautions: 'Wear gloves and mask.'
        }
      },
      {
        id: 'hist_2',
        crop: 'Chilli',
        cropKey: 'crop.chilli',
        disease: 'Chilli Leaf Curl Virus',
        diseaseKey: 'disease.chilli_leaf_curl',
        confidence: 88,
        confidenceTier: 'high',
        isHealthy: false,
        imageUri:
          'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
        timestamp: Date.now() - 86400000,
        symptoms: ['Upward curling of leaves and stunted growth'],
        organicTreatments: [
          {
            title: 'Yellow Sticky Traps',
            desc: 'Install sticky cards to catch whitefly vectors naturally.',
            icon: 'Sparkles'
          }
        ],
        prevention: [
          {
            title: 'Border Crops',
            desc: 'Plant dense maize barrier around the field.',
            icon: 'ShieldCheck'
          }
        ],
        chemicalFallback: {
          title: 'Acetamiprid 20% SP',
          desc: 'Target vector whiteflies only under emergency guidelines.',
          precautions: 'Strict label compliance.'
        }
      }
    ];
  }
}

export const historyService = new HistoryService();

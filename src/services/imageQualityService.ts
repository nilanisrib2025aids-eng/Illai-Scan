export interface ImageQualityReport {
  isValid: boolean;
  score: number; // 0 to 100
  reasonKey?: string;
  isBlurry: boolean;
  isLowLight: boolean;
  isNotPlant?: boolean;
}

export class ImageQualityService {
  /**
   * Fast client-side image check analyzing brightness, resolution, and plant/foliage color profiles.
   */
  public async analyzeQuality(imageDataUrl: string): Promise<ImageQualityReport> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 160;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ isValid: true, score: 90, isBlurry: false, isLowLight: false });
            return;
          }

          ctx.drawImage(img, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;

          let totalBrightness = 0;
          let plantLikePixelCount = 0;
          const totalPixels = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += lum;

            // Agricultural plant, leaf, crop stem, lesion, chlorosis signature:
            // 1. Healthy green foliage / leaf veins: Green channel significantly higher than blue and red
            const isGreenLeaf = (g > 40 && g > r * 0.92 && g > b * 1.10);
            // 2. Chlorotic yellow leaf patches (e.g. blight, nutrient deficiency): high red & green, low blue
            const isYellowLeaf = (r > 70 && g > 65 && b < 105 && Math.abs(r - g) < 55);
            // 3. Blighted brown/tan necrotic leaf spots (early blight, late blight, blast lesions):
            const isBlightBrown = (r > 45 && g > 35 && b < 65 && r >= g && g > b);

            if (isGreenLeaf || isYellowLeaf || isBlightBrown) {
              plantLikePixelCount++;
            }
          }

          const avgBrightness = totalBrightness / totalPixels;

          // 1. Check if photo is too dark (e.g. night shot or lens covered)
          if (avgBrightness < 25) {
            resolve({
              isValid: false,
              score: 30,
              reasonKey: 'quality.low_light',
              isBlurry: false,
              isLowLight: true,
              isNotPlant: false
            });
            return;
          }

          // 2. Low resolution / corrupt check
          if (img.width < 90 || img.height < 90) {
            resolve({
              isValid: false,
              score: 35,
              reasonKey: 'quality.blurry',
              isBlurry: true,
              isLowLight: false,
              isNotPlant: false
            });
            return;
          }

          // 3. Plant / Leaf Verification:
          // A photo of a crop leaf or plant part must contain at least 15% plant/leaf coloration.
          // Photos of faces, cars, laptops, furniture, walls, floor tiles, animals fail this threshold.
          const plantRatio = plantLikePixelCount / totalPixels;
          if (plantRatio < 0.15) {
            resolve({
              isValid: false,
              score: 20,
              reasonKey: 'quality.not_a_plant',
              isBlurry: false,
              isLowLight: false,
              isNotPlant: true
            });
            return;
          }

          resolve({
            isValid: true,
            score: 95,
            reasonKey: 'quality.good',
            isBlurry: false,
            isLowLight: false,
            isNotPlant: false
          });
        } catch {
          resolve({ isValid: true, score: 88, isBlurry: false, isLowLight: false });
        }
      };

      img.onerror = () => {
        resolve({ isValid: false, score: 20, reasonKey: 'quality.blurry', isBlurry: true, isLowLight: false });
      };

      img.src = imageDataUrl;
    });
  }
}

export const imageQualityService = new ImageQualityService();


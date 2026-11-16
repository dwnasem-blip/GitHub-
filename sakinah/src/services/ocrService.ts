import * as FileSystem from "expo-file-system";
import { ImagePickerAsset } from "expo-image-picker";

export interface OCRResult {
  fullText: string;
  confidence: number;
  detectedLanguage: string;
  textBlocks: TextBlock[];
  rawResponse?: any;
}

export interface TextBlock {
  text: string;
  confidence: number;
  bounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export class OCRService {
  private apiKey: string;
  private baseUrl: string = "https://vision.googleapis.com/v1/images:annotate";
  private maxImageSize: number = 20 * 1024 * 1024; // 20MB

  constructor(googleVisionApiKey: string) {
    this.apiKey = googleVisionApiKey;
  }

  /**
   * Convert image file to base64 string
   */
  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imagePath);
      if (!fileInfo.exists) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      if (fileInfo.size && fileInfo.size > this.maxImageSize) {
        throw new Error(`Image size exceeds maximum of ${this.maxImageSize / (1024 * 1024)}MB`);
      }

      const base64 = await FileSystem.readAsStringAsync(imagePath, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  }

  /**
   * Compress image before sending to OCR (reduce network usage)
   */
  private async compressImage(imagePath: string): Promise<string> {
    // For now, return original path
    // In production, would use expo-image-manipulator
    // to resize to 1200px width, convert to WebP
    return imagePath;
  }

  /**
   * Extract text from image using Google Vision API
   */
  async extractText(imagePath: string): Promise<OCRResult> {
    try {
      // Compress image first
      const compressedPath = await this.compressImage(imagePath);

      // Convert to base64
      const base64Image = await this.imageToBase64(compressedPath);

      // Prepare request
      const requestPayload = {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: "DOCUMENT_TEXT_DETECTION",
              },
              {
                type: "TEXT_DETECTION",
              },
              {
                type: "LABEL_DETECTION",
              },
            ],
            imageContext: {
              languageHints: ["ar", "en"], // Support Arabic and English
            },
          },
        ],
      };

      // Call Google Vision API
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Vision API error:", errorData);
        throw new Error(`OCR API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse response
      return this.parseVisionResponse(data);
    } catch (error) {
      console.error("Error extracting text with OCR:", error);
      throw error;
    }
  }

  /**
   * Parse Google Vision API response
   */
  private parseVisionResponse(data: any): OCRResult {
    try {
      const response = data.responses[0];

      if (response.error) {
        throw new Error(`Vision API error: ${response.error.message}`);
      }

      let fullText = "";
      let confidence = 1.0;
      const textBlocks: TextBlock[] = [];
      let detectedLanguage = "unknown";

      // Extract full text from document annotation
      if (response.fullTextAnnotation) {
        fullText = response.fullTextAnnotation.text;
        confidence = this.calculateConfidence(response.fullTextAnnotation);

        // Extract individual text blocks
        if (response.fullTextAnnotation.pages) {
          response.fullTextAnnotation.pages.forEach((page: any) => {
            if (page.blocks) {
              page.blocks.forEach((block: any) => {
                const blockText = this.extractBlockText(block);
                if (blockText) {
                  textBlocks.push({
                    text: blockText,
                    confidence: this.calculateBlockConfidence(block),
                    bounds: this.extractBounds(block),
                  });
                }
              });
            }
          });
        }
      } else if (response.textAnnotations && response.textAnnotations.length > 0) {
        // Fallback to simpler text annotations
        fullText = response.textAnnotations[0].description;
        confidence = this.calculateConfidence(response.textAnnotations[0]);

        response.textAnnotations.slice(1).forEach((annotation: any) => {
          textBlocks.push({
            text: annotation.description,
            confidence: this.calculateConfidence(annotation),
          });
        });
      }

      // Detect language from labels if available
      if (response.labelAnnotations && response.labelAnnotations.length > 0) {
        const labels = response.labelAnnotations.map((l: any) => l.description);
        if (labels.some((l: string) => /arabic|urdu/i.test(l))) {
          detectedLanguage = "ar";
        } else {
          detectedLanguage = "en";
        }
      }

      return {
        fullText: fullText.trim(),
        confidence: confidence,
        detectedLanguage: detectedLanguage,
        textBlocks: textBlocks,
        rawResponse: data,
      };
    } catch (error) {
      console.error("Error parsing Vision response:", error);
      throw error;
    }
  }

  /**
   * Calculate average confidence from annotations
   */
  private calculateConfidence(annotation: any): number {
    if (!annotation) return 0.5;

    // Google Vision doesn't always return confidence, default to high for text
    // In practice, we can estimate based on response structure
    if (annotation.vertices && annotation.vertices.length > 0) {
      return 0.9; // Well-detected text
    }

    return 0.75;
  }

  /**
   * Calculate confidence for a text block
   */
  private calculateBlockConfidence(block: any): number {
    if (!block.paragraphs) return 0.75;

    const confidences = block.paragraphs.flatMap((p: any) =>
      (p.words || []).flatMap((w: any) => (w.symbols || []).map((s: any) => s.confidence || 0.9))
    );

    if (confidences.length === 0) return 0.75;

    return confidences.reduce((a: number, b: number) => a + b, 0) / confidences.length;
  }

  /**
   * Extract text from a block
   */
  private extractBlockText(block: any): string {
    if (!block.paragraphs) return "";

    return block.paragraphs
      .flatMap((p: any) =>
        (p.words || [])
          .flatMap((w: any) => (w.symbols || []).map((s: any) => s.text))
          .join("")
      )
      .join(" ");
  }

  /**
   * Extract bounding box from block
   */
  private extractBounds(block: any): {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null {
    if (!block.boundingBox || !block.boundingBox.vertices) {
      return null;
    }

    const vertices = block.boundingBox.vertices;
    const left = Math.min(...vertices.map((v: any) => v.x || 0));
    const top = Math.min(...vertices.map((v: any) => v.y || 0));
    const right = Math.max(...vertices.map((v: any) => v.x || 0));
    const bottom = Math.max(...vertices.map((v: any) => v.y || 0));

    return {
      left: left,
      top: top,
      width: right - left,
      height: bottom - top,
    };
  }

  /**
   * Check if extracted text confidence is acceptable
   */
  isConfidentEnough(result: OCRResult, threshold: number = 0.7): boolean {
    return result.confidence >= threshold;
  }

  /**
   * Clean and normalize extracted text
   */
  normalizeText(text: string): string {
    // Remove extra whitespace
    text = text.replace(/\s+/g, " ").trim();

    // Fix common OCR errors (can be expanded)
    text = text.replace(/0/g, "O"); // Common confusion in some contexts
    text = text.replace(/l/g, "1"); // Common confusion in some contexts

    return text;
  }

  /**
   * Estimate the subject of the extracted text
   */
  estimateSubject(text: string): string {
    const lowerText = text.toLowerCase();

    // Count keyword occurrences
    const keywords: Record<string, string[]> = {
      math: ["equation", "solve", "algebra", "calculus", "geometry", "formula", "derivative"],
      science: ["reaction", "force", "atom", "element", "biology", "physics", "chemistry"],
      history: ["war", "revolution", "civilization", "empire", "century", "historical"],
      language: ["grammar", "essay", "vocabulary", "sentence", "literature", "poem"],
      geography: ["latitude", "longitude", "map", "continent", "climate", "terrain"],
    };

    let bestSubject = "general";
    let bestScore = 0;

    for (const [subject, words] of Object.entries(keywords)) {
      const score = words.filter((word) => lowerText.includes(word)).length;
      if (score > bestScore) {
        bestScore = score;
        bestSubject = subject;
      }
    }

    return bestSubject;
  }
}

/**
 * Create OCR service instance
 */
export function createOCRService(apiKey: string): OCRService {
  return new OCRService(apiKey);
}

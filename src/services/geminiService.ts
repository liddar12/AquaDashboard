import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  pH: number | null;
  orp: number | null;
  recommendation: string;
  confidence: number;
}

export interface SmartNudge {
  id: string;
  type: 'weather' | 'event' | 'maintenance' | 'efficiency';
  title: string;
  message: string;
  actionLabel?: string;
}

export async function analyzePoolPhoto(base64Image: string): Promise<AnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
    Analyze this photo of a pool water test (test strip, drop test, or digital gauge).
    Extract the pH level and ORP (Oxidation-Reduction Potential) value if visible.
    Provide a professional recommendation based on the findings.
    
    If the values are not clear, provide your best estimate but indicate a lower confidence.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pH: { type: Type.NUMBER, description: "The detected pH level (e.g., 7.4)" },
            orp: { type: Type.NUMBER, description: "The detected ORP value in mV (e.g., 650)" },
            recommendation: { type: Type.STRING, description: "Actionable advice for the pool owner" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
          },
          required: ["recommendation", "confidence"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return {
      pH: result.pH || null,
      orp: result.orp || null,
      recommendation: result.recommendation,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze photo. Please try again with a clearer image.");
  }
}

export async function generateSmartNudges(context: {
  weather?: string;
  events?: string[];
  telemetry?: any;
}): Promise<SmartNudge[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const prompt = `
    You are an expert pool management AI. Based on the following context, generate 2-3 "Smart Nudges" for the pool owner.
    Nudges should be proactive, context-aware, and actionable.
    
    Context:
    - Weather: ${context.weather || 'Unknown'}
    - Events: ${context.events?.join(', ') || 'None'}
    - Telemetry Summary: ${JSON.stringify(context.telemetry || {})}
    
    Return the nudges in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['weather', 'event', 'maintenance', 'efficiency'] },
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              actionLabel: { type: Type.STRING },
            },
            required: ["id", "type", "title", "message"],
          },
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Nudge Error:", error);
    return [
      {
        id: 'fallback-1',
        type: 'maintenance',
        title: 'System Check',
        message: 'Ensure all equipment is running optimally before the weekend.',
        actionLabel: 'Run Diagnostics'
      }
    ];
  }
}

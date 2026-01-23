
import { GoogleGenAI, Type } from "@google/genai";
import { ScreeningResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const screeningSchema = {
  type: Type.OBJECT,
  properties: {
    candidateName: { type: Type.STRING },
    resumeOverview: { type: Type.STRING, description: "Quick summary of profile strengths." },
    resumeType: { type: Type.STRING, enum: ['Fresher', 'Entry-level', 'Experienced'] },
    domain: { type: Type.STRING, enum: ['IT', 'Data', 'AI', 'Software', 'Non-IT'] },
    formatQuality: { type: Type.STRING, enum: ['Poor', 'Average', 'Good', 'ATS-Optimized'] },
    hiringReadiness: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
    overallMatchScore: { type: Type.NUMBER },
    atsScore: { type: Type.NUMBER },
    screeningIssuesFound: { type: Type.ARRAY, items: { type: Type.STRING } },
    sectionSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sectionName: { type: Type.STRING },
          currentIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    atsOptimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    finalScore: { type: Type.NUMBER },
    skillsAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } }
      }
    },
    interviewQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          purpose: { type: Type.STRING, description: "Why this question is being asked based on their resume gaps." },
          expectedAnswerClues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific technical or behavioral points to listen for." }
        }
      },
      description: "3-5 tailored questions to verify gaps or deep-dive into strengths."
    },
    revisedResumeStructure: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { role: { type: Type.STRING }, bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } } }
          }
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } } }
          }
        },
        education: { type: Type.STRING }
      }
    },
    explanation: { type: Type.STRING }
  },
  required: [
    "candidateName", "resumeOverview", "resumeType", "domain", "formatQuality",
    "hiringReadiness", "overallMatchScore", "atsScore", "screeningIssuesFound",
    "sectionSuggestions", "atsOptimizationTips", "finalScore", "skillsAnalysis",
    "interviewQuestions", "revisedResumeStructure", "explanation"
  ],
};

function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  return matches && matches.length === 3 ? { mimeType: matches[1], data: matches[2] } : null;
}

export async function analyzeResume(jobDescription: string, resumeText: string, resumeDataUrl?: string): Promise<ScreeningResult> {
  const prompt = `
    ACT AS: Expert Technical Recruiter & ATS Optimizer.
    TASK: Analyze RESUME against JOB DESCRIPTION (JD).
    
    INSTRUCTIONS:
    1. EXTRACT: Use OCR for document content.
    2. SCORE: Evaluate match percentage and ATS compatibility.
    3. AUDIT: List specific formatting and keyword issues.
    4. INTERVIEW PREP: Generate 3-5 high-impact questions specifically designed to uncover potential weaknesses identified in their resume or gaps vs the JD.
    5. OPTIMIZE: Provide professional bullet points and structure.
    
    JD: ${jobDescription}
    RESUME: ${resumeText || "Extract from attached multimodal source."}
  `;

  const parts: any[] = [{ text: prompt }];
  if (resumeDataUrl) {
    const parsed = parseDataUrl(resumeDataUrl);
    if (parsed) parts.push({ inlineData: { mimeType: parsed.mimeType, data: parsed.data } });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview", 
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: screeningSchema,
      temperature: 0.1,
      thinkingConfig: { thinkingBudget: 1000 }
    },
  });

  if (!response.text) throw new Error("Empty response");
  return JSON.parse(response.text) as ScreeningResult;
}

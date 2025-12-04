import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Ideally, this should be initialized inside functions to ensure API key freshness if changed,
// but for this demo environment we assume process.env.API_KEY is stable.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDailyBriefing = async (): Promise<string> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Summarise the last 24 hours of AI, Digital Health, and Product Management hiring trends in the UK and London market. Focus on funding news and major leadership moves. Keep it under 5 bullet points.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "No briefing available.";
  } catch (e) {
    console.error("Briefing error", e);
    return "Unable to fetch daily briefing due to API restrictions.";
  }
};

export const generateClarifyingQuestions = async (jobDescription: string): Promise<string[]> => {
  const ai = getAI();
  const model = "gemini-2.5-flash";

  const prompt = `
  Review the following Job Description (JD). 
  Identify 3-5 critical missing pieces of information needed to accurately assess fit, priority (RICE), and strategy.
  Ask these as direct questions to the user.
  
  JD:
  ${jobDescription.substring(0, 5000)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    // Safety parse
    const text = response.text || "[]";
    try {
        return JSON.parse(text);
    } catch {
        return ["Could not parse clarifying questions. Please proceed."];
    }
  } catch (e) {
    console.error(e);
    return ["What is your primary motivation for this role?", "Do you meet the core technical requirements?"];
  }
};

export const analyzeJobFull = async (
  jobDescription: string, 
  userClarifications: string
) => {
  const ai = getAI();
  // Using flash for complex analysis with tools
  const model = "gemini-2.5-flash"; 

  const prompt = `
  PERFORM FULL JOB ANALYSIS.

  JOB DESCRIPTION:
  ${jobDescription.substring(0, 10000)}

  USER CLARIFICATIONS:
  ${userClarifications}

  TASKS:
  1. Extract skills (required vs missing based on LHF profile assumption).
  2. Estimate UK Salary Range (use Search).
  3. Market Scan: Funding, Competitors, News (use Search).
  4. Generate Analysis Metrics (RICE, MoSCoW).
  5. Generate Artefacts (CV bullets, Cover Letter draft).
  
  Output MUST be valid JSON matching the schema provided.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.OBJECT,
        properties: {
          skills_required: { type: Type.ARRAY, items: { type: Type.STRING } },
          skills_missing: { type: Type.ARRAY, items: { type: Type.STRING } },
          competency_match_score: { type: Type.NUMBER },
          salary_range: { type: Type.STRING },
          rice_score: { type: Type.NUMBER },
          moscow_priority: { type: Type.STRING, enum: ["Must", "Should", "Could", "Won't"] },
          summary_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          red_flags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      },
      marketIntel: {
        type: Type.OBJECT,
        properties: {
          funding_news: { type: Type.ARRAY, items: { type: Type.STRING } },
          competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
          office_locations: { type: Type.ARRAY, items: { type: Type.STRING } },
          hiring_trends_context: { type: Type.STRING }
        }
      },
      artefacts: {
        type: Type.OBJECT,
        properties: {
          cv_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          cover_letter_draft: { type: Type.STRING },
          linkedin_outreach: { type: Type.STRING },
          interview_prep: { type: Type.ARRAY, items: { type: Type.STRING } },
          star_stories: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Full analysis failed", e);
    throw new Error("Analysis failed. Please try again.");
  }
};

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAttendanceInsights(attendanceData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following attendance data for Sankara College:
        ${JSON.stringify(attendanceData)}
        
        Provide:
        1. A high-level summary of attendance trends.
        2. Identify specific "at-risk" students (attendance below 75%).
        3. Strategic recommendations for faculty to improve engagement.
        4. Any patterns in date/subject-wise absences.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            atRiskStudents: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "atRiskStudents", "recommendations"]
        }
      }
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      summary: "Unable to generate AI insights at this moment.",
      atRiskStudents: [],
      recommendations: ["Ensure all students mark attendance via the verified protocol."]
    };
  }
}
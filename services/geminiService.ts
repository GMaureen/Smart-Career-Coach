
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizQuestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async askQuestion(question: string, context?: string, imageData?: string) {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are FundaBuddy, a friendly and encouraging AI tutor for South African students in Grades 8-12. 
      Your goal is to help students learn by explaining concepts clearly, providing study tips, and answering their school-related questions.
      
      User Question: ${question}
      ${context ? `Additional context from student notes: ${context}` : ""}
      
      Requirements:
      1. Provide a clear, age-appropriate, and educational answer.
      2. Use bullet points for readability.
      3. Use South African context or examples where relevant.
      4. Always end with a short "Study Tip" to help the student master the topic.
      5. Tone: Supportive, patient, and academic yet accessible.
    `;

    const contents: any = { parts: [{ text: prompt }] };
    if (imageData) {
      contents.parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData
        }
      });
    }

    const result = await ai.models.generateContent({ model, contents });
    return result.text;
  },

  async translateContent(text: string, targetLanguage: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional educational translator. Translate the following educational text into ${targetLanguage}, one of South Africa's official languages. Keep the academic tone appropriate for high school learners and preserve technical terms in brackets if they are essential. Text: "${text}"`,
    });
    return response.text;
  },

  async generateEducationalImage(concept: string) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ 
          text: `Create a clear, educational illustration to help a student understand the following concept:

Concept: ${concept}

Requirements:
- Style: Simple, clean, and easy to read
- Type: Diagram, infographic, or visual aid suitable for learning
- Labels: Include important parts if applicable
- Colors: Use soft blue-based colors, not too flashy
- Perspective: Front view or top view if relevant
- Resolution: High enough for display in the app
- Do not include unnecessary details or text` 
        }],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async generateSpeech(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this educational summary in a very friendly, encouraging, and supportive tone to help a student feel confident: ${text.substring(0, 500)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  },

  async classifyTopic(question: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Identify the main academic subject of this question in 1-2 words (e.g., "Mathematics", "Physical Sciences", "Life Sciences", "History"). Question: "${question}"`,
    });
    return response.text?.trim() || "General Studies";
  },

  async generateQuiz(notes: string): Promise<QuizQuestion[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a 5-question multiple choice quiz based on these notes to help a Grade 8-12 student study: "${notes}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WeeklyPlan, MealOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchLibraryItems = async (type: 'workout', category: string): Promise<any[]> => {
  const prompt = `Atue como um bibliotecário fitness de elite. 
    Forneça uma lista técnica EXTREMAMENTE variada e profunda de exercícios para a categoria "${category}". 
    O objetivo é mapear todos os exercícios possíveis para essa modalidade.
    
    Agrupe-os rigorosamente pelas zonas musculares (muscleGroup): Peito, Costas, Pernas, Glúteos, Ombros, Braços, Core/Abdômen, Cardio ou Funcional.
    
    Para cada exercício retorne: 
    - name: Nome técnico.
    - description: Dica rápida de biomecânica.
    - muscleGroup: A zona muscular principal.
    - kcalEstimate: Estimativa de queima (número).
    - mediaUrl: URL de VÍDEO de execução técnica (preferencialmente do YouTube, canais como @fit-distance, @MuscleAndMotion, etc).
    - source: Referência científica/técnica.

    Retorne o máximo de itens possíveis. Retorne APENAS um array JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Erro ao buscar exercícios:", e);
    return [];
  }
};

export const generatePlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  const prompt = `
    Atue como um Especialista em Fisiologia do Exercício e Nutricionista Esportivo de Elite.
    Gere um plano semanal COMPLETO de treino e nutrição inteligente para o seguinte perfil:
    ${JSON.stringify(profile, null, 2)}
    
    DIRETRIZ OBRIGATÓRIA DE FONTES E REFERÊNCIAS:
    Todas as informações de exercícios e nutrição DEVEM conter fonte bibliográfica.
    
    Regras de Treino:
    1. Cada exercício deve incluir uma 'mediaUrl'. PRIORIZE links de vídeos de demonstração técnica de canais como '@fit-distance' no YouTube ou equivalentes de alta qualidade demonstrando a biomecânica perfeita.
    2. Cada exercício deve incluir uma 'source' (referência técnica/científica).
    3. Respeite 'maxSessionTime' de ${profile.availability.maxSessionTime} minutos.

    Regras Nutricionais:
    1. ${profile.nutrition.mealsPerDay} refeições por dia com 4 opções cada.
    
    IMPORTANTE: Retorne APENAS o JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["weeklyPlan", "summary", "motivation", "references"],
          properties: {
            weeklyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["day", "workout", "nutrition"],
                properties: {
                  day: { type: Type.STRING },
                  workout: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["id", "name", "reps", "sets", "rest", "description", "muscleGroup", "source", "mediaUrl", "kcalEstimate"],
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        rest: { type: Type.STRING },
                        description: { type: Type.STRING },
                        muscleGroup: { type: Type.STRING },
                        source: { type: Type.STRING },
                        mediaUrl: { type: Type.STRING },
                        kcalEstimate: { type: Type.NUMBER }
                      }
                    }
                  },
                  nutrition: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["mealName", "time", "options"],
                      properties: {
                        mealName: { type: Type.STRING },
                        time: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            required: ["food", "portion", "calories", "protein", "carbs", "fats", "source"],
                            properties: {
                              food: { type: Type.STRING },
                              portion: { type: Type.STRING },
                              calories: { type: Type.NUMBER },
                              protein: { type: Type.NUMBER },
                              carbs: { type: Type.NUMBER },
                              fats: { type: Type.NUMBER },
                              source: { type: Type.STRING }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            summary: { type: Type.STRING },
            motivation: { type: Type.STRING },
            references: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    
    return JSON.parse(text) as WeeklyPlan;
  } catch (error) {
    console.error("Erro na geração do plano:", error);
    throw error;
  }
};

export const calculateNutrition = async (food: string, portion: string, profile?: UserProfile): Promise<Partial<MealOption>> => {
  const context = profile ? `Considerando o perfil de ${profile.nutrition.objective} e meta de ${profile.targetWeight}kg.` : "";
  const prompt = `
    Como um nutricionista de precisão, calcule os dados nutricionais exatos para o seguinte item:
    Alimento: ${food}
    Porção: ${portion}
    ${context}
    Retorne APENAS o JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["calories", "protein", "carbs", "fats", "source"],
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            source: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro no cálculo nutricional:", error);
    throw error;
  }
};

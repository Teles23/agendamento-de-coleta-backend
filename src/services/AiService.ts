import axios from "axios";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no servidor.");
  }

  const response = await axios.post(
    GEMINI_URL,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
    },
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/**
 * Classifica materiais recicláveis com base em uma descrição de texto.
 * Retorna um objeto JSON com nomes de materiais como chaves e booleanos como valores.
 */
export async function classifyMaterials(
  description: string,
): Promise<Record<string, boolean> | null> {
  const prompt = `Analise os itens de descarte a seguir: "${description}". 
  Com base neles, retorne APENAS um JSON plano com chaves booleanas para as categorias de materiais que você identificar.
  As categorias possíveis são exatamente os nomes dos materiais.
  Exemplo de formato esperado: {"Papel": true, "Plástico": false, "Vidro": true}
  Não inclua explicações, apenas o JSON. Se houver itens perigosos ou não recicláveis, simplesmente não os inclua no JSON ou coloque como false.`;

  const result = await callGemini(prompt);
  if (!result) return null;

  const cleanJson = result.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanJson) as Record<string, boolean>;
}

type PendingCollection = {
  citizenName: string;
  neighborhood: string;
  materials: { name: string }[];
};

/**
 * Sugere uma ordem de coleta otimizada por proximidade de bairros.
 */
export async function optimizeRoutes(
  pendingCollections: PendingCollection[],
): Promise<string | null> {
  const listaTxt = pendingCollections
    .map(
      (p) =>
        `- ${p.citizenName} (${p.neighborhood}): ${p.materials.map((m) => m.name).join(",")}`,
    )
    .join("\n");

  const prompt = `Como um especialista em logística, analise estas solicitações de coleta reciclável:
  ${listaTxt}
  
  Sugira uma ordem de coleta para otimizar o tempo e combustível, agrupando por proximidade de bairros. 
  Responda de forma concisa e amigável com emojis. Seja direto.`;

  return await callGemini(prompt);
}

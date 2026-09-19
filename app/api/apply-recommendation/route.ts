import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { recommendation, optimizedCV, jobPosting } = await req.json();

  const prompt = `Eres un experto en currículums vitae y sistemas ATS.

Tenés el siguiente CV optimizado:
${optimizedCV}

La búsqueda laboral es:
${jobPosting}

El usuario quiere aplicar esta recomendación específica:
"${recommendation}"

Tu tarea: explicá de forma concreta y práctica cómo aplicar exactamente esta recomendación en este CV.
- Mostrá un ejemplo de ANTES y DESPUÉS si aplica
- Sé específico con el texto sugerido, no genérico
- Máximo 3-4 pasos o sugerencias concretas
- Tono directo, sin rodeos

Respondé en formato JSON:
{
  "howTo": ["paso o sugerencia 1", "paso o sugerencia 2", ...],
  "example": { "before": "texto original si aplica", "after": "texto mejorado sugerido" }
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: "Respondé exclusivamente con el objeto JSON solicitado, sin texto adicional, sin explicaciones y sin bloques de código markdown (nada de ```).",
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content.find((b) => b.type === "text");
    if (!content) {
      return NextResponse.json({ error: "Error en respuesta" }, { status: 500 });
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("apply-recommendation: respuesta sin JSON:", content.text);
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("apply-recommendation: JSON inválido:", content.text, parseErr);
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

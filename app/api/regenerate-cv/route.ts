import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { optimizedCV, recommendations, userNotes, keywords } = await req.json();

  if (!optimizedCV || !recommendations) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const recWithNotes = recommendations
    .map((rec: string, i: number) => {
      const note = userNotes?.[i]?.trim();
      return `Recomendación ${i + 1}: ${rec}${note ? `\nCambios aplicados por el candidato: ${note}` : ""}`;
    })
    .join("\n\n");

  const prompt = `Eres un experto en reclutamiento y sistemas ATS. Tu tarea es mejorar un CV optimizado incorporando los cambios que el candidato indica haber aplicado a cada recomendación.

CV ACTUAL:
${optimizedCV}

RECOMENDACIONES Y CAMBIOS APLICADOS POR EL CANDIDATO:
${recWithNotes}

KEYWORDS ATS A MANTENER: ${keywords?.join(", ") || ""}

Instrucciones:
- Reescribí el CV incorporando naturalmente los cambios que el candidato describió en cada recomendación.
- Donde el candidato no indicó cambios, mejorá el texto igualmente si es posible.
- Mantené todas las keywords ATS.
- Mantené el formato limpio y ATS-friendly.
- No inventes información que el candidato no haya mencionado.

Respondé solo con el texto del CV mejorado, sin JSON, sin explicaciones adicionales.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Error en respuesta" }, { status: 500 });
    }

    return NextResponse.json({ regeneratedCV: content.text });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

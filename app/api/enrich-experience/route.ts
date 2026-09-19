import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { experienceNotes, jobTitle, company, dateRange, targetJob, keywords } =
    await req.json();

  const prompt = `Eres un experto redactor de currículums vitae. Tu tarea es crear una descripción profesional y convincente de una experiencia laboral basándote en notas informales del candidato.

PUESTO OBJETIVO (para el que aplica): ${targetJob}
PALABRAS CLAVE ATS A INCLUIR: ${keywords?.join(", ") || ""}

DATOS DE LA EXPERIENCIA A REDACTAR:
- Título del puesto: ${jobTitle}
- Empresa/Organización: ${company}
- Período: ${dateRange}
- Notas del candidato (pueden ser informales, fragmentadas o escuetas):
${experienceNotes}

INSTRUCCIONES:
- El candidato tiene aproximadamente 22 años, está en sus primeras experiencias laborales o recién egresado
- Redacta 4-6 bullets en primera persona implícita (sin "yo")
- El tono debe ser profesional pero CREÍBLE para alguien joven: evitá palabras grandilocuentes como "lideré equipos multidisciplinarios" si no corresponde; usá verbos reales como Colaboré, Participé, Desarrollé, Apoyé, Coordiné, Diseñé, Implementé según corresponda
- Los logros y métricas deben ser modestos y verosímiles para alguien de esa edad (no "aumenté ventas un 300%", sino "contribuí a mejorar el proceso reduciendo tiempos en un 20%")
- Cada bullet debe comenzar con un verbo de acción en pasado
- Incorpora naturalmente las palabras clave ATS relevantes sin que suene forzado
- Si la experiencia es de voluntariado, proyecto universitario o freelance, presentala como experiencia real sin mentir explícitamente (ej: "proyecto académico" → "proyecto de desarrollo", "voluntariado" → puede quedarse como tal o presentarse como "colaboración")
- El resultado debe sonar auténtico, no como un CV corporativo de alguien de 40 años

Responde en formato JSON:
{
  "bullets": ["bullet 1", "bullet 2", ...],
  "formattedExperience": "bloque completo listo para insertar en el CV",
  "tip": "consejo breve sobre esta experiencia"
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
      console.error("enrich-experience: respuesta sin JSON:", content.text);
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }

    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("enrich-experience: JSON inválido:", content.text, parseErr);
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { jobPosting, cvText } = await req.json();

  if (!jobPosting || !cvText) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const prompt = `Eres un experto en reclutamiento y sistemas ATS (Applicant Tracking Systems).
Tu tarea es optimizar un currículum vitae para que pase los filtros ATS de una búsqueda laboral específica.

BÚSQUEDA LABORAL:
${jobPosting}

CURRÍCULUM ORIGINAL:
${cvText}

Realiza el siguiente análisis y transformación:

1. PALABRAS CLAVE ATS: Extrae las 15-20 palabras clave más importantes del aviso laboral que los ATS buscarán.

2. CV OPTIMIZADO: Reescribe el CV incorporando naturalmente esas palabras clave.
   - En la sección de EXPERIENCIA LABORAL, mantén los datos reales pero deja marcadores [EXPERIENCIA_1], [EXPERIENCIA_2], etc. donde irían las descripciones detalladas de cada puesto (esto se completará después).
   - Ajusta el perfil/resumen profesional para que resuene con el puesto.
   - Adapta las secciones de habilidades y competencias usando el vocabulario exacto del aviso.
   - Mantén el formato limpio y ATS-friendly (sin tablas, sin columnas complejas).

3. SCORE ATS ESTIMADO: Da un porcentaje estimado de match con el puesto (0-100%).

4. RECOMENDACIONES: Lista 5 sugerencias concretas para mejorar el CV en función del puesto cargado. Reglas estrictas:
   - Cada sugerencia debe indicar en qué SECCIÓN del CV aplica: Datos personales, Perfil profesional, Educación, Experiencia laboral, o Habilidades.
   - La mejora sugerida debe ser coherente con esa sección. No sugieras habilidades técnicas en la sección de datos personales, ni datos de contacto en habilidades, etc.
   - Cada sugerencia debe estar directamente relacionada con los requisitos del puesto cargado, no ser genérica.
   - Formato de cada sugerencia: "[SECCIÓN] Problema detectado. Qué hacer exactamente." Dos oraciones, tono directo.
   - El candidato tiene ~22 años, las sugerencias deben ser alcanzables y realistas.

Responde en formato JSON con esta estructura:
{
  "keywords": ["keyword1", "keyword2", ...],
  "optimizedCV": "texto completo del CV optimizado",
  "atsScore": 75,
  "recommendations": ["rec1", "rec2", ...],
  "keywordsFound": ["keywords que ya estaban en el CV original"],
  "keywordsMissing": ["keywords importantes que faltaban"]
}`;

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

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Error parseando respuesta" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

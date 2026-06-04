"use client";

import { useState } from "react";
import type { OptimizeResult, ExperienceEntry } from "@/app/page";

type Props = {
  result: OptimizeResult;
  experiences: ExperienceEntry[];
  setExperiences: (e: ExperienceEntry[]) => void;
  onContinue: (finalCV: string) => void;
  onBack: () => void;
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-green-400 border-green-500" :
    score >= 50 ? "text-yellow-400 border-yellow-500" :
    "text-red-400 border-red-500";
  return (
    <div className={`inline-flex items-center gap-1 border rounded-full px-3 py-1 text-2xl font-bold ${color}`}>
      {score}%
      <span className="text-sm font-normal">match ATS</span>
    </div>
  );
}

type RecSuggestion = {
  howTo: string[];
  example?: { before: string; after: string };
};

export default function StepTwo({ result, experiences, setExperiences, onContinue, onBack }: Props) {
  const [enriching, setEnriching] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState<number | null>(null);
  const [recSuggestions, setRecSuggestions] = useState<Record<number, RecSuggestion>>({});

  async function applyRecommendation(rec: string, index: number) {
    setRecLoading(index);
    try {
      const res = await fetch("/api/apply-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendation: rec,
          optimizedCV: result.optimizedCV,
          jobPosting: "",
        }),
      });
      const data = await res.json();
      setRecSuggestions((prev) => ({ ...prev, [index]: data }));
    } catch (e) {
      console.error(e);
    } finally {
      setRecLoading(null);
    }
  }

  function addExperience() {
    const newEntry: ExperienceEntry = {
      id: crypto.randomUUID(),
      jobTitle: "",
      company: "",
      dateRange: "",
      notes: "",
    };
    setExperiences([...experiences, newEntry]);
  }

  function updateExperience(id: string, field: keyof ExperienceEntry, value: string) {
    setExperiences(
      experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  function removeExperience(id: string) {
    setExperiences(experiences.filter((e) => e.id !== id));
  }

  async function enrichExperience(entry: ExperienceEntry) {
    if (!entry.notes.trim()) return;
    setEnriching(entry.id);
    try {
      const res = await fetch("/api/enrich-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceNotes: entry.notes,
          jobTitle: entry.jobTitle,
          company: entry.company,
          dateRange: entry.dateRange,
          targetJob: "puesto objetivo",
          keywords: result.keywords,
        }),
      });
      const data = await res.json();
      if (data.formattedExperience) {
        updateExperience(entry.id, "enriched", data.formattedExperience);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnriching(null);
    }
  }

  function buildFinalCV() {
    let cv = result.optimizedCV;
    experiences.forEach((exp, i) => {
      const marker = `[EXPERIENCIA_${i + 1}]`;
      const content = exp.enriched || exp.notes || "[Sin completar]";
      const block = `${exp.jobTitle} | ${exp.company} | ${exp.dateRange}\n${content}`;
      cv = cv.includes(marker) ? cv.replace(marker, block) : cv + `\n\n${block}`;
    });
    onContinue(cv);
  }

  return (
    <div className="space-y-8">
      {/* ATS Score & Keywords */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Resultado del Análisis ATS</h2>
            <ScoreBadge score={result.atsScore} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">
              Keywords detectadas en tu CV
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.keywordsFound.map((k) => (
                <span key={k} className="bg-green-900/40 border border-green-700 text-green-300 text-xs px-2 py-1 rounded-full">
                  {k}
                </span>
              ))}
              {result.keywordsFound.length === 0 && (
                <span className="text-slate-500 text-sm">Ninguna encontrada</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-2">
              Keywords faltantes (a incorporar)
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.keywordsMissing.map((k) => (
                <span key={k} className="bg-red-900/40 border border-red-700 text-red-300 text-xs px-2 py-1 rounded-full">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">
            Recomendaciones
          </h3>
          <ul className="space-y-3">
            {result.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-500 shrink-0 mt-0.5">→</span>
                  <span className="flex-1">{r}</span>
                  <button
                    onClick={() => applyRecommendation(r, i)}
                    disabled={recLoading === i}
                    className="shrink-0 px-2 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-cyan-300 transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    {recLoading === i ? (
                      <>
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        ...
                      </>
                    ) : recSuggestions[i] ? "Ver de nuevo" : "¿Cómo aplicar?"}
                  </button>
                </div>
                {recSuggestions[i] && (
                  <div className="mt-2 ml-4 bg-slate-900/80 border border-cyan-900 rounded-xl p-4 space-y-2">
                    <ul className="space-y-1">
                      {recSuggestions[i].howTo.map((step, j) => (
                        <li key={j} className="text-xs text-slate-300 flex gap-2">
                          <span className="text-cyan-500 shrink-0">{j + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                    {recSuggestions[i].example?.after && (
                      <div className="mt-2 space-y-1">
                        {recSuggestions[i].example?.before && (
                          <div className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-400 font-semibold mb-1">Antes</p>
                            <p className="text-xs text-slate-300">{recSuggestions[i].example?.before}</p>
                          </div>
                        )}
                        <div className="bg-green-900/20 border border-green-800 rounded-lg px-3 py-2">
                          <p className="text-xs text-green-400 font-semibold mb-1">Después</p>
                          <p className="text-xs text-slate-300">{recSuggestions[i].example?.after}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Experience builder */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Enriquecer Experiencias Laborales</h2>
            <p className="text-xs text-slate-400 mt-1">
              Agregá experiencias con tus notas informales — la IA las convierte en bullets profesionales
            </p>
          </div>
          <button
            onClick={addExperience}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            + Agregar experiencia
          </button>
        </div>

        {experiences.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8 border border-dashed border-slate-700 rounded-xl">
            No hay experiencias agregadas. Podés continuar sin agregar o agregar ahora.
          </p>
        )}

        <div className="space-y-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Título del puesto</label>
                  <input
                    value={exp.jobTitle}
                    onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)}
                    placeholder="Ej: Coordinador de Marketing"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Empresa / Organización</label>
                  <input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    placeholder="Ej: Startup XYZ / Universidad / ONG"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Período</label>
                  <input
                    value={exp.dateRange}
                    onChange={(e) => updateExperience(exp.id, "dateRange", e.target.value)}
                    placeholder="Ej: Mar 2022 – Dic 2023"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Notas / Descripción informal (qué hiciste, proyectos, logros, contexto)
                </label>
                <textarea
                  value={exp.notes}
                  onChange={(e) => updateExperience(exp.id, "notes", e.target.value)}
                  rows={4}
                  placeholder="Ej: Manejaba las redes sociales, armé campañas de email, coordiné con el equipo de diseño para los banners, conseguimos subir los seguidores un montón, también hice el análisis en excel de las métricas cada mes..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {exp.enriched && (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                  <p className="text-xs text-green-400 font-semibold mb-2 uppercase tracking-wide">
                    Versión profesional generada
                  </p>
                  <pre className="text-sm text-slate-200 whitespace-pre-wrap font-sans">{exp.enriched}</pre>
                  <button
                    onClick={() => updateExperience(exp.id, "enriched", "")}
                    className="mt-2 text-xs text-slate-500 hover:text-slate-300"
                  >
                    Regenerar
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => enrichExperience(exp)}
                  disabled={enriching === exp.id || !exp.notes.trim()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {enriching === exp.id ? (
                    <>
                      <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generando...
                    </>
                  ) : (
                    "✨ Enriquecer con IA"
                  )}
                </button>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="px-3 py-2 text-slate-500 hover:text-red-400 text-sm transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-sm transition-colors"
        >
          ← Volver
        </button>
        <button
          onClick={buildFinalCV}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-semibold text-white transition-all shadow-lg shadow-cyan-900/30"
        >
          Ver CV Final →
        </button>
      </div>
    </div>
  );
}

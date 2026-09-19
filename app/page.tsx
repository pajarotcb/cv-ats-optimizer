"use client";

import { useState } from "react";
import StepOne from "@/components/StepOne";
import StepTwo from "@/components/StepTwo";
import StepThree from "@/components/StepThree";

export type OptimizeResult = {
  keywords: string[];
  optimizedCV: string;
  atsScore: number;
  recommendations: string[];
  keywordsFound: string[];
  keywordsMissing: string[];
};

export type ExperienceEntry = {
  id: string;
  jobTitle: string;
  company: string;
  dateRange: string;
  notes: string;
  enriched?: string;
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [jobPosting, setJobPosting] = useState("");
  const [cvText, setCvText] = useState("");
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([]);
  const [finalCV, setFinalCV] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            CV ATS Optimizer
          </h1>
          <p className="text-slate-400 mt-2">
            Optimizá tu currículum para pasar los filtros automáticos de RRHH
          </p>
          <button
            onClick={() => setShowInstructions(true)}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium text-slate-300 transition-colors"
          >
            ¿Cómo funciona?
          </button>
        </div>

        {showInstructions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">Cómo usar el CV ATS Optimizer</h2>
              <ol className="space-y-4">
                {[
                  { n: 1, title: "Pegá la búsqueda laboral", desc: "Copiá el texto completo del aviso de trabajo (descripción, requisitos, etc.)." },
                  { n: 2, title: "Pegá tu CV", desc: "Copiá tu CV en texto plano. Sin tablas ni columnas — solo texto." },
                  { n: 3, title: "Analizá", desc: "La IA detecta las keywords del aviso, las incorpora a tu CV y te da un score ATS estimado." },
                  { n: 4, title: "Aplicá las recomendaciones", desc: "Leé las 5 sugerencias por sección. Escribí qué cambios aplicaste y regenerá el CV." },
                  { n: 5, title: "Editá y re-evaluá", desc: "En el paso final podés editar el CV directamente y re-evaluarlo para ver el nuevo score." },
                ].map(({ n, title, desc }) => (
                  <li key={n} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-cyan-500 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {n}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{title}</p>
                      <p className="text-slate-400 text-sm mt-0.5">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <button
                onClick={() => setShowInstructions(false)}
                className="mt-8 w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-semibold text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { n: 1, label: "Análisis ATS" },
            { n: 2, label: "Experiencias" },
            { n: 3, label: "CV Final" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= n ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-400"
                }`}
              >
                {n}
              </div>
              <span className={`text-sm ${step >= n ? "text-white" : "text-slate-500"}`}>
                {label}
              </span>
              {n < 3 && (
                <div className={`w-12 h-0.5 ${step > n ? "bg-cyan-500" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <StepOne
            jobPosting={jobPosting}
            setJobPosting={setJobPosting}
            cvText={cvText}
            setCvText={setCvText}
            onResult={(r) => {
              setResult(r);
              setStep(2);
            }}
          />
        )}
        {step === 2 && result && (
          <StepTwo
            result={result}
            experiences={experiences}
            setExperiences={setExperiences}
            onContinue={(enrichedCV) => {
              setFinalCV(enrichedCV);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepThree
            finalCV={finalCV}
            result={result!}
            jobPosting={jobPosting}
            onBack={() => setStep(2)}
            onRestart={() => {
              setStep(1);
              setResult(null);
              setExperiences([]);
              setFinalCV("");
            }}
          />
        )}
      </div>
    </main>
  );
}

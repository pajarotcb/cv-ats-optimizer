"use client";

import { useState } from "react";
import type { OptimizeResult } from "@/app/page";

type Props = {
  finalCV: string;
  result: OptimizeResult;
  jobPosting: string;
  onBack: () => void;
  onRestart: () => void;
};

export default function StepThree({ finalCV, result, jobPosting, onBack, onRestart }: Props) {
  const [copied, setCopied] = useState(false);
  const [editableCV, setEditableCV] = useState(finalCV);
  const [reevaluating, setReevaluating] = useState(false);
  const [reevalResult, setReevalResult] = useState<OptimizeResult | null>(null);

  async function reevaluate() {
    setReevaluating(true);
    setReevalResult(null);
    try {
      const res = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting, cvText: editableCV }),
      });
      const data = await res.json();
      if (!data.error) setReevalResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setReevaluating(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(editableCV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadTxt() {
    const blob = new Blob([editableCV], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CV_ATS_Optimizado.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeResult = reevalResult ?? result;
  const scoreColor =
    activeResult.atsScore >= 75 ? "text-green-400" :
    activeResult.atsScore >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Score ATS</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>{activeResult.atsScore}%</p>
            {reevalResult && <p className="text-xs text-purple-400 mt-0.5">Re-evaluado</p>}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Keywords</p>
            <p className="text-3xl font-bold text-cyan-400">{activeResult.keywords.length}</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={reevaluate}
            disabled={reevaluating}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            {reevaluating ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Evaluando...
              </>
            ) : "Re-evaluar ATS"}
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl text-sm font-medium transition-colors"
          >
            {copied ? "✓ Copiado!" : "Copiar texto"}
          </button>
          <button
            onClick={downloadTxt}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-sm font-medium transition-colors"
          >
            Descargar .txt
          </button>
        </div>
      </div>

      {/* Editable CV */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">CV Optimizado para ATS</h2>
          <p className="text-xs text-slate-400">Podés editarlo directamente aquí</p>
        </div>
        <textarea
          value={editableCV}
          onChange={(e) => setEditableCV(e.target.value)}
          rows={30}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-y"
        />
      </div>

      {/* Keywords used */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-3">
          Keywords ATS {reevalResult ? "— Re-evaluación" : "incorporadas en el CV"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-green-400 font-semibold mb-2">Encontradas en el CV</p>
            <div className="flex flex-wrap gap-2">
              {activeResult.keywordsFound.map((k) => (
                <span key={k} className="bg-green-900/40 border border-green-700 text-green-300 text-xs px-2 py-1 rounded-full">{k}</span>
              ))}
              {activeResult.keywordsFound.length === 0 && <span className="text-slate-500 text-xs">Ninguna</span>}
            </div>
          </div>
          <div>
            <p className="text-xs text-red-400 font-semibold mb-2">Faltantes</p>
            <div className="flex flex-wrap gap-2">
              {activeResult.keywordsMissing.map((k) => (
                <span key={k} className="bg-red-900/40 border border-red-700 text-red-300 text-xs px-2 py-1 rounded-full">{k}</span>
              ))}
              {activeResult.keywordsMissing.length === 0 && <span className="text-slate-500 text-xs">Ninguna — ¡excelente!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium text-sm transition-colors"
        >
          ← Editar experiencias
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-white text-sm transition-all"
        >
          Nueva búsqueda ↺
        </button>
      </div>
    </div>
  );
}

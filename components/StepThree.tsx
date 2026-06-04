"use client";

import { useState } from "react";
import type { OptimizeResult } from "@/app/page";

type Props = {
  finalCV: string;
  result: OptimizeResult;
  onBack: () => void;
  onRestart: () => void;
};

export default function StepThree({ finalCV, result, onBack, onRestart }: Props) {
  const [copied, setCopied] = useState(false);
  const [editableCV, setEditableCV] = useState(finalCV);

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

  const scoreColor =
    result.atsScore >= 75 ? "text-green-400" :
    result.atsScore >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Score ATS</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>{result.atsScore}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">Keywords incorporadas</p>
            <p className="text-3xl font-bold text-cyan-400">{result.keywords.length}</p>
          </div>
        </div>
        <div className="flex gap-3">
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
          Keywords ATS incorporadas en el CV
        </h3>
        <div className="flex flex-wrap gap-2">
          {result.keywords.map((k) => (
            <span
              key={k}
              className={`text-xs px-2 py-1 rounded-full border ${
                result.keywordsFound.includes(k)
                  ? "bg-green-900/40 border-green-700 text-green-300"
                  : "bg-cyan-900/40 border-cyan-700 text-cyan-300"
              }`}
            >
              {k}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          <span className="text-green-400">Verde</span> = ya estaban · <span className="text-cyan-400">Azul</span> = agregadas por la IA
        </p>
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

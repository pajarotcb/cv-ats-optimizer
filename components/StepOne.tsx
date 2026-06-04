"use client";

import { useState } from "react";
import type { OptimizeResult } from "@/app/page";

type Props = {
  jobPosting: string;
  setJobPosting: (v: string) => void;
  cvText: string;
  setCvText: (v: string) => void;
  onResult: (r: OptimizeResult) => void;
};

export default function StepOne({ jobPosting, setJobPosting, cvText, setCvText, onResult }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!jobPosting.trim() || !cvText.trim()) {
      setError("Por favor completá ambos campos.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting, cvText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onResult(data);
    } catch (e) {
      setError("Error al procesar. Verificá tu clave API y volvé a intentar.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-cyan-400 uppercase tracking-wide">
          Aviso / Búsqueda Laboral
        </label>
        <p className="text-xs text-slate-400">Pegá el texto completo del aviso de trabajo</p>
        <textarea
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          rows={16}
          placeholder="Empresa XYZ busca Analista de Marketing con experiencia en..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-colors"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-cyan-400 uppercase tracking-wide">
          Tu Currículum Vitae
        </label>
        <p className="text-xs text-slate-400">Pegá tu CV en texto plano</p>
        <textarea
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          rows={16}
          placeholder="Nombre Apellido&#10;email@ejemplo.com | +54 11 xxxx-xxxx&#10;&#10;PERFIL PROFESIONAL&#10;..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-colors"
        />
      </div>

      <div className="md:col-span-2 flex flex-col items-center gap-3">
        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-2">
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analizando con IA...
            </>
          ) : (
            "Analizar y Optimizar CV →"
          )}
        </button>
      </div>
    </div>
  );
}

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
        </div>

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

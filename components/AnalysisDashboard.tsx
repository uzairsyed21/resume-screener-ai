
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';
import { ScreeningResult } from '../types';

interface AnalysisDashboardProps {
  result: ScreeningResult;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  const skillData = result.skillsAnalysis.map(s => ({
    subject: s.name,
    A: s.score,
    fullMark: 100,
  }));

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Scoring & Readiness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block">Overall Score</span>
          <div className="text-5xl font-black text-indigo-600">{result.finalScore}<span className="text-xl text-slate-300">/10</span></div>
        </div>
        <div className={`p-6 rounded-3xl border shadow-sm text-center flex flex-col justify-center ${getReadinessColor(result.hiringReadiness)}`}>
          <span className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1 block">Hiring Readiness</span>
          <div className="text-2xl font-black">{result.hiringReadiness}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block">ATS Compatibility</span>
          <div className="text-3xl font-black text-emerald-500">{result.atsScore}<span className="text-sm text-slate-300">/10</span></div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
          <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1 block">JD Match</span>
          <div className="text-3xl font-black text-sky-500">{result.overallMatchScore}%</div>
        </div>
      </div>

      {/* Resume Overview & Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fas fa-id-card text-indigo-500"></i>
            1. Resume Overview
          </h3>
          <p className="text-slate-700 leading-relaxed font-medium mb-6">
            {result.resumeOverview}
          </p>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase">Domain</span>
              <span className="text-sm font-bold text-slate-800">{result.domain}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase">Format</span>
              <span className="text-sm font-bold text-slate-800">{result.formatQuality}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase">Level</span>
              <span className="text-sm font-bold text-slate-800">{result.resumeType}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 w-full">Skills Analysis</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                <Radar name="Candidate" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Interview Prep Guide - NEW */}
      <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <i className="fas fa-comments text-[10rem]"></i>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center text-white">
              <i className="fas fa-microphone-alt text-xl"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black">AI Interview Prep Guide</h3>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Tailored verification questions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {result.interviewQuestions.map((iq, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all">
                <h4 className="text-sm font-black text-indigo-200 mb-2">Question {idx + 1}</h4>
                <p className="text-base font-bold text-white mb-4 leading-tight italic">"{iq.question}"</p>
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div>
                    <span className="text-[9px] font-black text-indigo-300 uppercase block mb-1">Purpose</span>
                    <p className="text-xs text-slate-300">{iq.purpose}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-indigo-300 uppercase block mb-1">What to listen for</span>
                    <div className="flex flex-wrap gap-2">
                      {iq.expectedAnswerClues.map((clue, ci) => (
                        <span key={ci} className="text-[10px] bg-indigo-500/30 text-indigo-100 px-2 py-1 rounded-lg border border-indigo-400/20">{clue}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screening Issues Found */}
      <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
        <h3 className="text-xl font-black text-rose-900 mb-6 flex items-center gap-3">
          <div className="bg-rose-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs">
            <i className="fas fa-search-minus"></i>
          </div>
          2. Screening Issues Found
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.screeningIssuesFound.map((issue, idx) => (
            <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-2xl shadow-sm border border-rose-100/50">
              <i className="fas fa-exclamation-triangle text-rose-400 mt-1"></i>
              <p className="text-sm font-semibold text-slate-700">{issue}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section-wise Improvements */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs">
            <i className="fas fa-edit"></i>
          </div>
          3. Section-wise Improvement Suggestions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {result.sectionSuggestions.map((section, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
              <h4 className="font-black text-indigo-600 text-xs uppercase tracking-widest mb-4">{section.sectionName}</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Current Flaws</span>
                  <p className="text-xs text-slate-500 italic leading-relaxed">{section.currentIssues.join(", ")}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">Recommended Fixes</span>
                  {section.suggestedImprovements.map((improvement, k) => (
                    <div key={k} className="text-sm text-slate-800 flex gap-3 items-start">
                      <i className="fas fa-magic text-indigo-400 mt-1 text-[10px]"></i>
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;

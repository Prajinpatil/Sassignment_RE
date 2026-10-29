import React from 'react';
import { Wind, Activity, Presentation, Code2, Database } from 'lucide-react';

export default function Navbar({ onOpenPitch, onOpenTechDocs, dataStatus }) {
  return (
    <header className="border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
              <Wind className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">UK Day-Ahead Wind Portal</span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                January 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">Wholesale Electricity Procurement & Accuracy Quantifier</p>
          </div>
        </div>

        {/* Right side controls & navigation */}
        <div className="flex items-center space-x-3">
          {/* Status badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Elexon BMRS Ready</span>
            {dataStatus && (
              <span className="text-slate-500 border-l border-slate-700 pl-2">
                {dataStatus.actualsCount} Actuals | {dataStatus.forecastsCount} Forecasts
              </span>
            )}
          </div>

          {/* Client Pitch Button */}
          <button
            onClick={onOpenPitch}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition shadow-sm"
          >
            <Presentation className="w-4 h-4 text-cyan-400" />
            <span>Client Pitch Guide</span>
          </button>

          {/* Tech Lead Docs Button */}
          <button
            onClick={onOpenTechDocs}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition shadow-sm"
          >
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>Tech Lead Specs</span>
          </button>
        </div>

      </div>
    </header>
  );
}

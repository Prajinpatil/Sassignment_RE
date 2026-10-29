import React from 'react';
import { Calendar, Clock, AlertCircle, Info, ChevronRight } from 'lucide-react';

const PRESET_DATES = [
  { label: 'Jan 05 (High Wind)', date: '2026-01-05' },
  { label: 'Jan 15 (Mid-Month)', date: '2026-01-15' },
  { label: 'Jan 22 (Ramp Event)', date: '2026-01-22' },
  { label: 'Jan 30 (Month End)', date: '2026-01-30' },
];

export default function GateSelector({
  targetDate,
  setTargetDate,
  cutoffHour,
  setCutoffHour,
  decisionDate,
  decisionGateTime,
  isLoading
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        
        {/* Date Selector */}
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Target Delivery Day (Delivery Day D)</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              min="2026-01-01"
              max="2026-01-31"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
            />
            {/* Quick date presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {PRESET_DATES.map((preset) => (
                <button
                  key={preset.date}
                  onClick={() => setTargetDate(preset.date)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition font-medium border ${
                    targetDate === preset.date
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gate Closure Cutoff Selector */}
        <div className="flex-1 lg:border-l lg:border-slate-800 lg:pl-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Day-Ahead Auction Cutoff (Day D-1 Gate Closure)</span>
            </label>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {cutoffHour.toString().padStart(2, '0')}:00 GMT
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="6"
              max="18"
              step="1"
              value={cutoffHour}
              onChange={(e) => setCutoffHour(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCutoffHour(11)}
                className={`px-2.5 py-1 text-xs rounded-md border font-mono transition ${
                  cutoffHour === 11
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="EPEX SPOT UK Auction Gate (11:00 GMT)"
              >
                11:00 (EPEX)
              </button>
              <button
                onClick={() => setCutoffHour(12)}
                className={`px-2.5 py-1 text-xs rounded-md border font-mono transition ${
                  cutoffHour === 12
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title="Nord Pool UK Auction Gate (12:00 GMT)"
              >
                12:00 (NordPool)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Decision Context Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Bids locked on <strong className="text-slate-200">{decisionDate}</strong> at{' '}
            <strong className="text-cyan-300">{cutoffHour.toString().padStart(2, '0')}:00 GMT</strong>. Filtering strictly to{' '}
            <code className="bg-slate-950 px-1 py-0.5 rounded text-slate-300">publishTime &le; {decisionGateTime}</code>
          </span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
          <span>Zero Data Leakage Guaranteed</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

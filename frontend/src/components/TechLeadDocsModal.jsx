import React from 'react';
import { X, Code2, Database, ShieldCheck, Cpu, Terminal, Bot } from 'lucide-react';

export default function TechLeadDocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Technical Architecture & Lead Review (Video Part 2: &le; 5 Mins)</h2>
            <p className="text-xs text-slate-400">System design, temporal integrity, algorithms, and code review</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-300">
          
          {/* Architecture */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 mb-2 text-base">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>1. System Architecture & Tech Stack</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block mb-1">Backend: Python & FastAPI</span>
                <p className="text-slate-400">
                  FastAPI service with NumPy/Pandas for vector math. High throughput, asynchronous endpoint design, automatic OpenAPI swagger docs at <code>/docs</code>.
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block mb-1">Frontend: React 18 + Vite</span>
                <p className="text-slate-400">
                  Vite build tool, Tailwind CSS for reactive UI, Recharts for composed time-series and error distributions, Lucide icons.
                </p>
              </div>
            </div>
          </div>

          {/* Temporal Integrity & Data Leakage */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-cyan-400 flex items-center gap-2 mb-2 text-base">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>2. Temporal Integrity & Anti-Leakage Algorithm</span>
            </h3>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              In day-ahead market evaluation, temporal data leakage is a critical risk. The algorithm guarantees that for target delivery day <code>D</code> with cutoff hour <code>T</code>:
            </p>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 overflow-x-auto font-mono">
{`SELECT startTime, generation, publishTime FROM (
  SELECT startTime, generation, publishTime,
         ROW_NUMBER() OVER(PARTITION BY startTime ORDER BY publishTime DESC) as rn
  FROM forecasts
  WHERE startTime >= :target_start AND startTime <= :target_end
    AND publishTime <= :decision_gate_time  -- STRICT ANTI-LEAKAGE CUTOFF
) WHERE rn = 1;`}
            </pre>
            <p className="text-[11px] text-slate-400 mt-2">
              Resolution alignment: WINDFOR provides hourly horizons (24 points/day) which map onto FUELHH's 48 half-hour settlement periods.
            </p>
          </div>

          {/* Testing & Reliability */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-2 text-base">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>3. Automated Tests & Production Readiness</span>
            </h3>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li>• Unit tests in <code>backend/tests/test_metrics.py</code> covering MAE, RMSE, Bias, zero-division in MAPE, and cutoff boundary checks.</li>
              <li>• Zero-latency local caching of January 2026 Elexon data (1,632 actuals, 20,440 forecasts) in SQLite.</li>
              <li>• Containerized with multi-stage Docker &amp; docker-compose for one-click launch.</li>
            </ul>
          </div>

          {/* AI Disclosure */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-2 text-base">
              <Bot className="w-4 h-4 text-amber-400" />
              <span>4. AI Tool Usage Disclosure (as required by RFP)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI developer tooling was utilized for rapid prototyping, API schema introspection of Elexon BMRS Swagger specifications, statistical edge case testing, and UI scaffolding. All market domain logic, temporal SQL partitioning, and architectural boundaries were verified and validated against official Elexon documentation.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
          >
            Close Specs
          </button>
        </div>

      </div>
    </div>
  );
}

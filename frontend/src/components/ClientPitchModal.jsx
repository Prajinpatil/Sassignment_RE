import React from 'react';
import { X, Presentation, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ClientPitchModal({ isOpen, onClose }) {
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Client Pitch Guide (Video Part 1: &le; 5 Mins)</h2>
            <p className="text-xs text-slate-400">Executive walkthrough for the UK Energy Utility Trading Desk</p>
          </div>
        </div>

        {/* Structured Talking Points */}
        <div className="space-y-6 text-sm text-slate-300">
          
          {/* Section 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-cyan-400 flex items-center gap-2 mb-2 text-base">
              <span>1. The Trading Desk Challenge (Minute 0:00 - 1:00)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              "As a UK electricity supplier, your day-ahead trading desk faces volatile cashout risks. When consumer demand peaks tomorrow, how much thermal generation must you contract today? Wind is your largest renewable source, but it fluctuates with weather. If you under-procure thermal power because wind is over-forecasted, you face punitive system imbalance cashout prices in the balancing mechanism."
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-2 text-base">
              <span>2. The Solution & Live Demo (Minute 1:00 - 3:15)</span>
            </h3>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Gate Closure Precision:</strong> Demonstrate changing the Day D-1 cut-off slider between 11:00 (EPEX) and 12:00 (Nord Pool). Show that the portal displays exactly the latest wind forecast available at decision time.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Forecast vs Actual Visualization:</strong> Walk through the 48 settlement periods. Point out the morning ramp and evening peak where deviations typically widen.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Risk Classification:</strong> Highlight the amber "Thermal Callout Risk" bars where wind was over-forecasted, showing traders the exact buffer required.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-2 text-base">
              <span>3. Quantified Decision-Making & ROI (Minute 3:15 - 4:45)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Explain the quantified metrics:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-white block mb-0.5">MAE & nMAE:</strong>
                <span className="text-slate-400">Establishes volumetric confidence bounds for portfolio risk sizing.</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <strong className="text-white block mb-0.5">P10 / P90 Margins:</strong>
                <span className="text-slate-400">Provides statistical worst-case bounds for thermal plant reserve margins.</span>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 mb-2 text-base">
              <span>4. Conclusion & Commercial Value (Minute 4:45 - 5:00)</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              "By moving from gut-feel to quantified forecast error evaluation, your desk saves hundreds of thousands of pounds annually in avoided imbalance penalties and optimizes thermal forward purchasing."
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
          >
            Close Pitch Guide
          </button>
        </div>

      </div>
    </div>
  );
}

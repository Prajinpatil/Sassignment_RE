import React from 'react';
import { Target, TrendingUp, TrendingDown, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function KpiCards({ metrics, isLoading }) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  const isOverForecast = metrics.bias > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. MAE Card */}
      <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur shadow-lg transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Mean Absolute Error</span>
          <Target className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.mae.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-slate-400">MW</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Normalized Error</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            {metrics.nmae}% of Peak
          </span>
        </div>
      </div>

      {/* 2. Bias / Directional Risk Card */}
      <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur shadow-lg transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">System Forecast Bias</span>
          {isOverForecast ? (
            <TrendingUp className="w-4 h-4 text-amber-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-cyan-400" />
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-extrabold tracking-tight ${
            isOverForecast ? 'text-amber-400' : 'text-cyan-400'
          }`}>
            {metrics.bias > 0 ? `+${metrics.bias.toLocaleString()}` : metrics.bias.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-slate-400">MW</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Procurement Implication</span>
          <span className={`px-2 py-0.5 rounded-full font-semibold border ${
            isOverForecast
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
          }`}>
            {isOverForecast ? 'Thermal Callout Shortage' : 'Surplus Generation'}
          </span>
        </div>
      </div>

      {/* 3. RMSE & Volatility Card */}
      <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur shadow-lg transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">RMSE (Volatility Penalty)</span>
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {metrics.rmse.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-slate-400">MW</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Max Single Miss</span>
          <span className="font-mono text-slate-300 font-medium">
            {Math.max(Math.abs(metrics.maxOverForecastMW), Math.abs(metrics.maxUnderForecastMW)).toLocaleString()} MW
          </span>
        </div>
      </div>

      {/* 4. Total Daily Energy Card */}
      <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur shadow-lg transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Wind Energy</span>
          <Zap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {Math.round(metrics.totalActualMWh).toLocaleString()}
          </span>
          <span className="text-sm font-medium text-slate-400">MWh</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Day-Ahead Expected</span>
          <span className="font-mono text-slate-300 font-medium">
            {Math.round(metrics.totalForecastMWh).toLocaleString()} MWh
          </span>
        </div>
      </div>

    </div>
  );
}

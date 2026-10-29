import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { BarChart3, AlertTriangle } from 'lucide-react';

export default function ErrorDistributionChart({ periods, metrics, isLoading }) {
  if (isLoading || !periods || periods.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-72 flex items-center justify-center animate-pulse">
        <span className="text-slate-500 text-sm">Loading Error Distribution...</span>
      </div>
    );
  }

  const barData = periods.map((p) => ({
    period: p.settlementPeriod,
    label: p.targetTime.split(' - ')[0],
    fullTime: p.targetTime,
    error: p.errorMW,
    absError: p.absErrorMW
  }));

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOver = (data.error || 0) > 0;
      return (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-xl text-xs">
          <div className="font-bold text-white mb-1">
            Period {data.period} ({data.fullTime})
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Forecast Error:</span>
            <span className={`font-mono font-bold ${isOver ? 'text-amber-400' : 'text-cyan-400'}`}>
              {data.error > 0 ? `+${data.error.toLocaleString()}` : data.error.toLocaleString()} MW
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isOver
              ? 'Over-forecasted: Under-procured day-ahead (Shortage)'
              : 'Under-forecasted: Over-procured day-ahead (Surplus)'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Settlement Period Error Profile (Forecast - Actual MW)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantifies the volumetric thermal deficit/surplus risk exposure across all 48 settlement periods
          </p>
        </div>

        {/* Confidence interval summary */}
        {metrics && (
          <div className="flex items-center gap-3 text-xs bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">P10 Error: <strong className="text-cyan-300 font-mono">{metrics.p10ErrorMW} MW</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">P90 Error: <strong className="text-amber-300 font-mono">+{metrics.p90ErrorMW} MW</strong></span>
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={10}
              interval={3}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              unit=" MW"
            />
            <Tooltip content={<CustomBarTooltip />} />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
            
            <Bar dataKey="error" radius={[2, 2, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.error >= 0 ? '#F59E0B' : '#06B6D4'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            Positive (+): Over-Forecast (Thermal Shortage Risk)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
            Negative (-): Under-Forecast (Wind Surplus)
          </span>
        </div>
      </div>
    </div>
  );
}

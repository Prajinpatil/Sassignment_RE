import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Wind, Info, Eye, Layers } from 'lucide-react';

export default function ForecastChart({ periods, targetDate, cutoffHour, isLoading }) {
  const [showErrorArea, setShowErrorArea] = useState(true);

  if (isLoading || !periods || periods.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-96 flex items-center justify-center animate-pulse">
        <span className="text-slate-500 text-sm">Loading 48 Settlement Periods...</span>
      </div>
    );
  }

  // Format data for chart
  const chartData = periods.map((p) => ({
    period: p.settlementPeriod,
    label: p.targetTime.split(' - ')[0],
    fullTime: p.targetTime,
    actual: p.actualMW,
    forecast: p.forecastMW,
    error: p.errorMW,
    absError: p.absErrorMW,
    publishTime: p.forecastPublishTime,
    risk: p.residualProcurementRisk
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOver = (data.error || 0) > 0;
      return (
        <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur text-xs min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <span className="font-bold text-white">Period {data.period} ({data.fullTime})</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              data.risk === 'DEFICIT_RISK'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : data.risk === 'SURPLUS_RISK'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {data.risk === 'DEFICIT_RISK' ? 'Thermal Callout' : data.risk === 'SURPLUS_RISK' ? 'Wind Surplus' : 'Balanced'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Actual Wind Delivered:
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {data.actual !== null ? `${data.actual.toLocaleString()} MW` : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                Day-Ahead Forecast:
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {data.forecast !== null ? `${data.forecast.toLocaleString()} MW` : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
              <span className="text-slate-400">Forecast Error (F - A):</span>
              <span className={`font-mono font-bold ${isOver ? 'text-amber-400' : 'text-cyan-400'}`}>
                {data.error !== null ? `${data.error > 0 ? '+' : ''}${data.error.toLocaleString()} MW` : 'N/A'}
              </span>
            </div>

            {data.publishTime && (
              <div className="text-[10px] text-slate-500 pt-1">
                Forecast run: {data.publishTime.replace('T', ' ').replace('Z', ' GMT')}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl mb-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-400" />
            <span>Day-Ahead Forecast vs Actual Wind Generation (48 Settlement Periods)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Target Date: <strong className="text-slate-200">{targetDate}</strong> | Decision Gate: Day D-1 at <strong className="text-cyan-300">{cutoffHour.toString().padStart(2, '0')}:00 GMT</strong>
          </p>
        </div>

        {/* View toggles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowErrorArea(!showErrorArea)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              showErrorArea
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showErrorArea ? 'Hide Actual Fill' : 'Show Actual Fill'}</span>
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            
            <XAxis
              dataKey="label"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              interval={3}
            />
            
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              unit=" MW"
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
            />

            {showErrorArea && (
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Wind Generation (MW)"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualGradient)"
              />
            )}

            {!showErrorArea && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Wind Generation (MW)"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={false}
              />
            )}

            <Line
              type="monotone"
              dataKey="forecast"
              name="Day-Ahead Forecast (MW, Locked at D-1 Cutoff)"
              stroke="#06B6D4"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Commentary */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-emerald-500"></div>
            <span>Actual Wind (BMRS FUELHH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400"></div>
            <span>Day-Ahead Decision Forecast (BMRS WINDFOR)</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 hidden md:block">
          *Resolution: 30 minutes (Settlement Periods 1 to 48)
        </div>
      </div>

    </div>
  );
}

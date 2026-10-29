import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { CalendarDays, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchMonthOverview } from '../services/api';

export default function MonthlyAnalysis({ cutoffHour }) {
  const [monthData, setMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'hourly'

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchMonthOverview('2026-01', cutoffHour)
      .then((data) => {
        if (isMounted) {
          setMonthData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load month overview', err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [cutoffHour]);

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-80 flex items-center justify-center animate-pulse mb-6">
        <span className="text-slate-500 text-sm">Aggregating January 2026 Monthly Analytics...</span>
      </div>
    );
  }

  if (!monthData) return null;

  const dailyChartData = monthData.dailyMetrics.map((d) => ({
    date: d.date.split('-')[2], // Day number e.g. "01", "15"
    fullDate: d.date,
    mae: d.mae,
    rmse: d.rmse,
    bias: d.bias,
    mape: d.mape
  }));

  const hourlyChartData = monthData.hourlyProfile.map((h) => ({
    period: h.settlementPeriod,
    time: h.timeLabel.split(' - ')[0],
    avgError: h.avgErrorMW,
    avgAbsError: h.avgAbsErrorMW,
    avgActual: h.avgActualMW,
    avgForecast: h.avgForecastMW,
    p10: h.p10ErrorMW,
    p90: h.p90ErrorMW
  }));

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl mb-6">
      
      {/* Header and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              <span>January 2026 Macro Analysis & Diurnal Patterns</span>
            </h3>
            <span className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              31 Days Aggregated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Overall Month MAE: <strong className="text-emerald-400">{monthData.overallMetrics.mae} MW</strong> | Overall Bias: <strong className={monthData.overallMetrics.bias > 0 ? 'text-amber-400' : 'text-cyan-400'}>{monthData.overallMetrics.bias > 0 ? `+${monthData.overallMetrics.bias}` : monthData.overallMetrics.bias} MW</strong>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'daily'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Trend (Jan 1-31)
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'hourly'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diurnal Profile (HH 1-48)
          </button>
        </div>
      </div>

      {/* Tab 1: Daily Trend */}
      {activeTab === 'daily' && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} unit=" Jan" />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit=" MW" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1F2937', borderRadius: '0.75rem' }}
                labelFormatter={(v) => `January ${v}, 2026`}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="mae"
                name="Daily Mean Absolute Error (MAE MW)"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
              <Line
                type="monotone"
                dataKey="bias"
                name="Daily Net Forecast Bias (MW)"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tab 2: Diurnal Profile */}
      {activeTab === 'hourly' && (
        <div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={10} interval={3} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} unit=" MW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1F2937', borderRadius: '0.75rem' }}
                  labelFormatter={(v, payload) => {
                    const p = payload && payload[0] ? payload[0].payload.period : '';
                    return `Settlement Period ${p} (${v})`;
                  }}
                />
                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                <Bar
                  dataKey="avgError"
                  name="Avg Bias by Settlement Period (MW)"
                  fill="#6366F1"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Trading Desk Insight:</strong> Note higher forecast errors during morning ramp hours (07:00 - 09:00 GMT). Day-ahead procurement desks should maintain higher thermal spinning reserves during these periods.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

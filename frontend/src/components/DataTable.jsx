import React, { useState } from 'react';
import { Table, Download, Search, CheckCircle, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { getExportCsvUrl } from '../services/api';

export default function DataTable({ periods, targetDate, cutoffHour, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  if (isLoading || !periods || periods.length === 0) {
    return null;
  }

  // Filter periods
  const filtered = periods.filter((p) => {
    const matchesSearch =
      p.settlementPeriod.toString().includes(searchTerm) ||
      p.targetTime.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || p.residualProcurementRisk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const exportUrl = getExportCsvUrl(targetDate, cutoffHour);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl mb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-emerald-400" />
            <span>Settlement Period Detail Ledger (48 Half-Hours)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual half-hourly breakdown of actual generation, day-ahead forecasts, and error residuals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search period or time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="DEFICIT_RISK">Thermal Deficit Risk</option>
            <option value="SURPLUS_RISK">Wind Surplus Risk</option>
            <option value="BALANCED">Balanced (&plusmn;200 MW)</option>
          </select>

          {/* Export CSV Button */}
          <a
            href={exportUrl}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Period</th>
              <th className="py-3 px-3">Time Window</th>
              <th className="py-3 px-3 text-right">Actual Wind (MW)</th>
              <th className="py-3 px-3 text-right">Day-Ahead FC (MW)</th>
              <th className="py-3 px-3 text-right">Error Delta (MW)</th>
              <th className="py-3 px-3 text-right">Abs Error (MW)</th>
              <th className="py-3 px-3 text-right">Error %</th>
              <th className="py-3 px-3 text-center">Procurement Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((p) => {
              const isOver = (p.errorMW || 0) > 0;
              return (
                <tr key={p.settlementPeriod} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-300">
                    HH {p.settlementPeriod.toString().padStart(2, '0')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">
                    {p.targetTime}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">
                    {p.actualMW !== null ? p.actualMW.toLocaleString() : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-400 font-semibold">
                    {p.forecastMW !== null ? p.forecastMW.toLocaleString() : '-'}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-bold ${
                    p.errorMW === null
                      ? 'text-slate-500'
                      : isOver
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`}>
                    {p.errorMW !== null ? `${p.errorMW > 0 ? '+' : ''}${p.errorMW.toLocaleString()}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">
                    {p.absErrorMW !== null ? p.absErrorMW.toLocaleString() : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {p.percentageError !== null ? `${p.percentageError}%` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.residualProcurementRisk === 'DEFICIT_RISK'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : p.residualProcurementRisk === 'SURPLUS_RISK'
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.residualProcurementRisk === 'DEFICIT_RISK'
                        ? 'Thermal Deficit'
                        : p.residualProcurementRisk === 'SURPLUS_RISK'
                        ? 'Wind Surplus'
                        : 'Balanced'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

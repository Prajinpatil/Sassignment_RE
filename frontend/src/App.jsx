import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GateSelector from './components/GateSelector';
import KpiCards from './components/KpiCards';
import ForecastChart from './components/ForecastChart';
import ErrorDistributionChart from './components/ErrorDistributionChart';
import MonthlyAnalysis from './components/MonthlyAnalysis';
import DataTable from './components/DataTable';
import ClientPitchModal from './components/ClientPitchModal';
import TechLeadDocsModal from './components/TechLeadDocsModal';
import { fetchDayAheadForecast, fetchDataStatus } from './services/api';

export default function App() {
  const [targetDate, setTargetDate] = useState('2026-01-15');
  const [cutoffHour, setCutoffHour] = useState(11);
  const [forecastData, setForecastData] = useState(null);
  const [dataStatus, setDataStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechDocsOpen, setIsTechDocsOpen] = useState(false);

  // Fetch data status on mount
  useEffect(() => {
    fetchDataStatus()
      .then((status) => setDataStatus(status))
      .catch((err) => console.warn('Could not fetch data status', err));
  }, []);

  // Fetch day-ahead forecast whenever date or cutoff changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    fetchDayAheadForecast(targetDate, cutoffHour)
      .then((data) => {
        if (isMounted) {
          setForecastData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching day ahead forecast', err);
          setErrorMessage(err.message || 'Failed to load forecast data');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetDate, cutoffHour]);

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Navbar */}
      <Navbar
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechDocs={() => setIsTechDocsOpen(true)}
        dataStatus={dataStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Error notification */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        )}

        {/* 1. Date & Gate Selector */}
        <GateSelector
          targetDate={targetDate}
          setTargetDate={setTargetDate}
          cutoffHour={cutoffHour}
          setCutoffHour={setCutoffHour}
          decisionDate={forecastData?.decisionDate || 'D-1'}
          decisionGateTime={forecastData?.decisionGateTime || ''}
          isLoading={isLoading}
        />

        {/* 2. Executive KPI Cards */}
        <KpiCards
          metrics={forecastData?.metrics}
          isLoading={isLoading}
        />

        {/* 3. Main Forecast vs Actual Chart */}
        <ForecastChart
          periods={forecastData?.periods}
          targetDate={targetDate}
          cutoffHour={cutoffHour}
          isLoading={isLoading}
        />

        {/* 4. Settlement Period Error Distribution Chart */}
        <ErrorDistributionChart
          periods={forecastData?.periods}
          metrics={forecastData?.metrics}
          isLoading={isLoading}
        />

        {/* 5. Macro Monthly Analytics & Diurnal Profile */}
        <MonthlyAnalysis
          cutoffHour={cutoffHour}
        />

        {/* 6. Detailed Settlement Period Ledger Table & CSV Export */}
        <DataTable
          periods={forecastData?.periods}
          targetDate={targetDate}
          cutoffHour={cutoffHour}
          isLoading={isLoading}
        />

      </main>

      {/* Modals for Video Presentations */}
      <ClientPitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
      />

      <TechLeadDocsModal
        isOpen={isTechDocsOpen}
        onClose={() => setIsTechDocsOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070B14] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>UK Wholesale Electricity Day-Ahead Wind Forecasting &amp; Quantified Error Evaluation Platform</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Data Source: Elexon BMRS (FUELHH &amp; WINDFOR)</span>
            <span>Target Period: January 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

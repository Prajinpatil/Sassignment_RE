const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchDayAheadForecast(date = '2026-01-15', cutoffHour = 11) {
  const url = `${API_BASE}/api/forecast/day-ahead?date=${date}&cutoffHour=${cutoffHour}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMonthOverview(month = '2026-01', cutoffHour = 11) {
  const url = `${API_BASE}/api/metrics/month-overview?month=${month}&cutoffHour=${cutoffHour}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch month overview: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchDataStatus() {
  const url = `${API_BASE}/api/data/status`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.statusText}`);
  }
  return res.json();
}

export function getExportCsvUrl(date = '2026-01-15', cutoffHour = 11) {
  return `${API_BASE}/api/forecast/export-csv?date=${date}&cutoffHour=${cutoffHour}`;
}

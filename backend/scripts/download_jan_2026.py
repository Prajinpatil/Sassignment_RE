"""
Download script for Elexon BMRS January 2026 Wind Actuals & Forecasts.
Endpoints:
  - Actual generation: FUELHH/stream (fuelType=WIND)
  - Forecast generation: WINDFOR/stream
Stores data into SQLite database (backend/data/elexon_wind_2026.db)
and exported JSON files for maximum portability.
"""

import os
import sys
import json
import time
import sqlite3
import urllib.request
import urllib.error
from datetime import datetime, timedelta

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
DB_PATH = os.path.join(DATA_DIR, "elexon_wind_2026.db")
ACTUALS_JSON_PATH = os.path.join(DATA_DIR, "actuals_jan_2026.json")
FORECASTS_JSON_PATH = os.path.join(DATA_DIR, "forecasts_jan_2026.json")

os.makedirs(DATA_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "UK-DayAhead-Energy-Portal/1.0 (Mozilla/5.0 compatible)",
    "Accept": "application/json"
}

def init_db(conn):
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS actuals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dataset TEXT,
            publishTime TEXT,
            startTime TEXT UNIQUE,
            settlementDate TEXT,
            settlementPeriod INTEGER,
            fuelType TEXT,
            generation REAL
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_actuals_start ON actuals(startTime)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_actuals_date ON actuals(settlementDate)")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS forecasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dataset TEXT,
            publishTime TEXT,
            startTime TEXT,
            generation REAL,
            UNIQUE(publishTime, startTime)
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_forecasts_start ON forecasts(startTime)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_forecasts_publish ON forecasts(publishTime)")
    conn.commit()

def fetch_json(url, retries=3, delay=2):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    raw = resp.read().decode("utf-8")
                    return json.loads(raw)
        except Exception as e:
            print(f"  Attempt {attempt + 1}/{retries} failed for {url}: {e}")
            if attempt < retries - 1:
                time.sleep(delay * (attempt + 1))
    return None

def download_actuals(conn):
    print(">>> Fetching FUELHH (Actual Wind Generation)...")
    url = (
        "https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream"
        "?settlementDateFrom=2025-12-31&settlementDateTo=2026-02-02&fuelType=WIND"
    )
    data = fetch_json(url)
    if not data:
        print("Failed to fetch actuals.")
        return 0

    cursor = conn.cursor()
    inserted = 0
    records = []
    for item in data:
        if item.get("fuelType") != "WIND":
            continue
        cursor.execute("""
            INSERT OR REPLACE INTO actuals 
            (dataset, publishTime, startTime, settlementDate, settlementPeriod, fuelType, generation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            item.get("dataset", "FUELHH"),
            item.get("publishTime"),
            item.get("startTime"),
            item.get("settlementDate"),
            item.get("settlementPeriod"),
            item.get("fuelType"),
            float(item.get("generation", 0.0))
        ))
        inserted += 1
        records.append({
            "startTime": item.get("startTime"),
            "settlementDate": item.get("settlementDate"),
            "settlementPeriod": item.get("settlementPeriod"),
            "generation": float(item.get("generation", 0.0))
        })
    conn.commit()
    print(f"Successfully stored {inserted} actual wind records.")
    with open(ACTUALS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)
    return inserted

def download_forecasts(conn):
    print(">>> Fetching WINDFOR (Forecasted Wind Generation in 3-day chunks)...")
    start_dt = datetime(2025, 12, 30, 0, 0, 0)
    end_dt = datetime(2026, 2, 2, 23, 59, 59)
    step = timedelta(days=3)

    cursor = conn.cursor()
    total_inserted = 0
    curr = start_dt

    while curr < end_dt:
        chunk_end = min(curr + step, end_dt)
        str_from = curr.strftime("%Y-%m-%dT%H:%M:%SZ")
        str_to = chunk_end.strftime("%Y-%m-%dT%H:%M:%SZ")
        url = (
            f"https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream"
            f"?publishDateTimeFrom={str_from}&publishDateTimeTo={str_to}"
        )
        print(f"  Fetching WINDFOR: {str_from} -> {str_to} ...")
        data = fetch_json(url)
        if data:
            batch = []
            for item in data:
                batch.append((
                    item.get("dataset", "WINDFOR"),
                    item.get("publishTime"),
                    item.get("startTime"),
                    float(item.get("generation", 0.0))
                ))
            cursor.executemany("""
                INSERT OR IGNORE INTO forecasts (dataset, publishTime, startTime, generation)
                VALUES (?, ?, ?, ?)
            """, batch)
            conn.commit()
            total_inserted += len(batch)
            print(f"    Added {len(batch)} forecast records (Cumulative: {total_inserted})")
        else:
            print(f"    No data returned or error for {str_from} to {str_to}")
        
        curr = chunk_end
        time.sleep(0.5)

    print(f"Successfully stored {total_inserted} total forecast records.")
    return total_inserted

def export_summary(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), MIN(startTime), MAX(startTime) FROM actuals")
    act_stats = cursor.fetchone()
    cursor.execute("SELECT COUNT(*), MIN(publishTime), MAX(publishTime) FROM forecasts")
    fc_stats = cursor.fetchone()
    print("\n================== SUMMARY ==================")
    print(f"Actuals count:   {act_stats[0]} (from {act_stats[1]} to {act_stats[2]})")
    print(f"Forecasts count: {fc_stats[0]} (from {fc_stats[1]} to {fc_stats[2]})")
    print("=============================================\n")

def main():
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    download_actuals(conn)
    download_forecasts(conn)
    export_summary(conn)
    conn.close()

if __name__ == "__main__":
    main()

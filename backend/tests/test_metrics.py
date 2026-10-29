import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
import numpy as np
from app.services.metrics_engine import calculate_accuracy_metrics
from app.services.data_manager import data_manager

class TestMetricsEngine(unittest.TestCase):
    def test_perfect_forecast(self):
        pairs = [{"actual": 1000.0, "forecast": 1000.0} for _ in range(10)]
        metrics = calculate_accuracy_metrics(pairs)
        self.assertEqual(metrics.mae, 0.0)
        self.assertEqual(metrics.rmse, 0.0)
        self.assertEqual(metrics.bias, 0.0)
        self.assertEqual(metrics.mape, 0.0)

    def test_over_forecast_bias(self):
        pairs = [
            {"actual": 1000.0, "forecast": 1200.0},
            {"actual": 1500.0, "forecast": 1700.0}
        ]
        metrics = calculate_accuracy_metrics(pairs)
        self.assertEqual(metrics.bias, 200.0)
        self.assertEqual(metrics.mae, 200.0)
        self.assertEqual(metrics.rmse, 200.0)

    def test_under_forecast_bias(self):
        pairs = [
            {"actual": 1000.0, "forecast": 800.0},
            {"actual": 1500.0, "forecast": 1300.0}
        ]
        metrics = calculate_accuracy_metrics(pairs)
        self.assertEqual(metrics.bias, -200.0)
        self.assertEqual(metrics.mae, 200.0)

    def test_zero_actual_handling(self):
        # Prevent division by zero
        pairs = [{"actual": 0.0, "forecast": 50.0}]
        metrics = calculate_accuracy_metrics(pairs)
        self.assertGreater(metrics.mape, 0.0)
        self.assertFalse(np.isinf(metrics.mape))

    def test_day_ahead_query_integrity(self):
        # Verify query runs for Jan 15 with 11:00 cutoff
        res = data_manager.get_day_ahead_forecast("2026-01-15", cutoff_hour=11)
        self.assertEqual(res.targetDate, "2026-01-15")
        self.assertEqual(len(res.periods), 48)
        self.assertGreater(res.metrics.validPeriodsCount, 0)
        self.assertGreater(res.metrics.mae, 0)

        # Verify that all forecast publish times are strictly before or at cutoff
        cutoff_dt = "2026-01-14T11:00:00Z"
        for p in res.periods:
            if p.forecastPublishTime:
                self.assertLessEqual(p.forecastPublishTime, cutoff_dt)

if __name__ == "__main__":
    unittest.main()

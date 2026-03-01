const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ForecastPoint {
  date: string;
  value: number | null;
  lower_ci: number | null;
  upper_ci: number | null;
}

export interface HistoricalPoint {
  date: string;
  value: number;
}

export interface Diagnostics {
  order: number[];
  seasonal_order: number[] | null;
  aic: number;
  bic: number;
  adf_statistic: number;
  adf_pvalue: number;
  is_stationary: boolean;
}

export interface Metrics {
  mape: number | null;
  rmse: number | null;
  mae: number | null;
}

export interface ForecastResponse {
  metric: string;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[];
  diagnostics: Diagnostics;
  metrics: Metrics;
}

export interface MetricResult {
  metric: string;
  data: ForecastResponse;
  error: string | null;
}

export async function postForecast(
  file: File,
  metric: string,
  forecastYears: number,
): Promise<ForecastResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("metric", metric);
  formData.append("forecast_years", String(forecastYears));

  const res = await fetch(`${API_BASE}/api/forecast`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function postForecastMulti(
  file: File,
  metrics: string[],
  forecastYears: number,
): Promise<MetricResult[]> {
  const results = await Promise.all(
    metrics.map(async (metric): Promise<MetricResult> => {
      try {
        const data = await postForecast(file, metric, forecastYears);
        return { metric, data, error: null };
      } catch (err) {
        return {
          metric,
          data: null as unknown as ForecastResponse,
          error: err instanceof Error ? err.message : "Terjadi kesalahan.",
        };
      }
    }),
  );
  return results;
}

import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from forecasting import run_forecast

st.set_page_config(layout="wide")

def main():
    st.title("📈 Forecasting Utilisasi CPU, Memory, dan Storage")

    # Buat layout 2 kolom atas
    top_left, top_right = st.columns([1, 2])

    # Inisialisasi state jika belum ada
    if "submitted" not in st.session_state:
        st.session_state.submitted = False
    if "last_forecast_years" not in st.session_state:
        st.session_state.last_forecast_years = None

    with top_left:
        st.header("Form Input")
        uploaded_file = st.file_uploader("Upload file CSV", type=["csv"])
        metric = st.selectbox("Pilih Metrik", ["CPU", "Memory", "Storage"])
        forecast_years = st.slider("Forecast ke Depan (Tahun)", 1, 5, 2)

        # Reset jika forecast_years berubah
        if forecast_years != st.session_state.last_forecast_years:
            st.session_state.submitted = False
            st.session_state.last_forecast_years = forecast_years

        # Tombol proses
        if st.button("Proses Forecast"):
            st.session_state.submitted = True

    if uploaded_file and st.session_state.submitted:
        data = pd.read_csv(uploaded_file, parse_dates=["Tanggal"])
        data.set_index("Tanggal", inplace=True)
        forecast_period = forecast_years * 12

        if metric not in data.columns:
            st.error(f"Kolom '{metric}' tidak ditemukan dalam data.")
            return

        forecast = run_forecast(data, metric, forecast_period)

        st.write("### Data Input (5 Teratas)")
        st.dataframe(data.head())

        with top_right:
            st.header("Grafik Forecasting")
            fig, ax = plt.subplots()
            data[metric].plot(ax=ax, label="Historis")
            forecast.plot(ax=ax, label="Forecast", linestyle="--")
            ax.set_title(f"Forecast {metric} untuk {forecast_years} tahun ke depan")
            ax.legend()
            st.pyplot(fig)

        # Forecast Tabel Horizontal (maks. 12 bulan pertama)
        st.write("### Forecast Semua Metrik (maks. 12 bulan pertama)")
        metrics_available = [m for m in ["CPU", "Memory", "Storage"] if m in data.columns]

        import numpy as np

        forecast_all = {}
        for m in metrics_available:
            f = run_forecast(data, m, forecast_period)
            if f is not None:
                vals = pd.Series(f.values[:12]).astype(float)
                padded = list(vals) + [np.nan] * (12 - len(vals))
                if pd.Series(padded).notna().any():
                    forecast_all[m] = padded

        if forecast_all:
            col_labels = [f"Bulan-{i+1}" for i in range(12)]
            df_forecast = pd.DataFrame.from_dict(
                forecast_all,
                orient="index",
                columns=col_labels
            )
            df_forecast = df_forecast[df_forecast.index.notnull()]
            df_forecast = df_forecast.dropna(how="all")  # hapus baris jika semua NaN
            st.dataframe(df_forecast, use_container_width=True, height=200)
        else:
            st.warning("Tidak ada hasil forecast yang berhasil dihitung.")

if __name__ == "__main__":
    main()
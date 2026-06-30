import sys
import json
# pyrefly: ignore [missing-import]
import joblib
import pandas as pd
import os
import warnings

warnings.filterwarnings("ignore")

try:
    if len(sys.argv) < 4:
        raise ValueError("Missing arguments")
        
    ph = float(sys.argv[1])
    tds = float(sys.argv[2])
    temp = float(sys.argv[3])
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    scaler_sup = joblib.load(os.path.join(BASE_DIR, 'scaler.pkl'))
    model_nutrients = joblib.load(os.path.join(BASE_DIR, 'model_nutrients.pkl'))
    model_ph = joblib.load(os.path.join(BASE_DIR, 'model_ph.pkl'))
    scaler_unsup = joblib.load(os.path.join(BASE_DIR, 'scaler_unsup.pkl'))
    kmeans = joblib.load(os.path.join(BASE_DIR, 'kmeans_model.pkl'))
    
    FEATURES = ['pH', 'TDS', 'water_temp']
    data = pd.DataFrame([[ph, tds, temp]], columns=FEATURES)
    
    # Supervised
    data_scaled_sup = scaler_sup.transform(data)
    pred_nutrients = int(model_nutrients.predict(data_scaled_sup)[0])
    prob_nutrients = float(model_nutrients.predict_proba(data_scaled_sup)[0].max())
    pred_ph = int(model_ph.predict(data_scaled_sup)[0])
    prob_ph = float(model_ph.predict_proba(data_scaled_sup)[0].max())
    
    # Unsupervised
    data_scaled_unsup = scaler_unsup.transform(data)
    cluster = int(kmeans.predict(data_scaled_unsup)[0])
    
    result = {
        "nutrients_adder_switch": "ON" if pred_nutrients == 1 else "OFF",
        "nutrients_adder_percentage": round(prob_nutrients * 100, 2),
        "ph_reducer_switch": "ON" if pred_ph == 1 else "OFF",
        "ph_reducer_percentage": round(prob_ph * 100, 2),
        "cluster_index": cluster
    }
    
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))

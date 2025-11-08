import pandas as pd
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

csv_path_env = os.getenv('CSV_PATH', 'spiderplot.csv')
if os.path.isabs(csv_path_env):
    CSV_PATH = csv_path_env
else:
    CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), csv_path_env)

def load_data():
    """Load and return the CSV data as a DataFrame"""
    try:
        if not CSV_PATH or not os.path.exists(CSV_PATH):
            print(f"CSV file not found at: {CSV_PATH}")
            return pd.DataFrame()
        df = pd.read_csv(CSV_PATH)
        return df
    except Exception as e:
        print(f"Error loading data from {CSV_PATH}: {e}")
        return pd.DataFrame()


import pandas as pd
import json
from datetime import datetime, timezone
import gspread
from google.oauth2.service_account import Credentials
from collections import OrderedDict
import hashlib
import os

# -------------------------------
# CONFIG
# -------------------------------
SHEET_NAME = "solo enrage tracker"  # Name of your Google Sheet
WORKSHEET_NAME = "data"  # Specific sheet name
CREDENTIALS_FILE = "scripts/credentials.json"  # Your downloaded service account JSON
# OUTPUT_JSON = "scripts/new_records.json"

# -------------------------------
# GOOGLE SHEETS AUTHENTICATION
# -------------------------------
def authenticate_google_sheets():
    scope = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]

    if "GOOGLE_CREDENTIALS" in os.environ:
        # CI / production
        info = json.loads(os.environ["GOOGLE_CREDENTIALS"])
        creds = Credentials.from_service_account_info(info, scopes=scope)
    else:
        # Local fallback (ignored by Git)
        creds = Credentials.from_service_account_file(
            CREDENTIALS_FILE,
            scopes=scope
        )

    return gspread.authorize(creds)


# -------------------------------
# READ GOOGLE SHEET DATA
# -------------------------------
def read_google_sheet():
    # Authenticate
    client = authenticate_google_sheets()
    
    # Open the spreadsheet
    spreadsheet = client.open(SHEET_NAME)
    
    # Select the specific worksheet
    worksheet = spreadsheet.worksheet(WORKSHEET_NAME)
    
    # Get all values
    data = worksheet.get_all_values()
    
    # Convert to pandas DataFrame (first row as headers)
    if data:
        df = pd.DataFrame(data[1:], columns=data[0])
    else:
        df = pd.DataFrame()
    
    return df

# -------------------------------
# PROCESS DATA
# -------------------------------
def process_data(df):
    # Clean column names (strip whitespace)
    df.columns = df.columns.str.strip()
    
    # Ensure we have the required columns
    required_columns = ["Enrage", "Date", "Player", "Kill time"]
    missing_columns = [col for col in required_columns if col not in df.columns]
    
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")
    
    # Clean data
    df = df.dropna(subset=["Enrage", "Date", "Player", "Kill time"])
    
    # Convert data types
    df["Enrage"] = pd.to_numeric(df["Enrage"], errors='coerce')
    df["Kill time"] = pd.to_numeric(df["Kill time"], errors='coerce')
    
    # Parse date - handle multiple date formats
    df["Date"] = pd.to_datetime(
        df["Date"],
        format="%Y-%m-%d %H:%M",
        errors="coerce"
    )

    # Remove rows with invalid dates
    df = df.dropna(subset=["Date"])
    
    # Convert to Unix timestamp (seconds)
    df["timeOfKill"] = df["Date"].dt.tz_localize(
        timezone.utc, ambiguous="NaT", nonexistent="NaT"
    ).astype("int64") // 10**9
    
    return df

# -------------------------------
# BUILD RECORDS
# -------------------------------
def build_records(df):
    records = []
    
    for _, row in df.iterrows():
        # Skip rows with NaN values
        if pd.isna(row["Enrage"]) or pd.isna(row["Kill time"]) or pd.isna(row["timeOfKill"]):
            continue
            
        record = {
            "enrage": int(row["Enrage"]),
            "timeOfKill": int(row["timeOfKill"]),
            "members": [
                {
                    "name": str(row["Player"]).strip()
                }
            ],
            "killTimeSeconds": float(row["Kill time"])
        }
        
        # Generate a unique ID for the record (for comparison)
        record["_id"] = generate_record_id(record)
        
        records.append(record)
    
    return records

# -------------------------------
# GENERATE UNIQUE RECORD ID
# -------------------------------
def generate_record_id(record):
    """Generate a unique ID for a record based on its content."""
    id_string = f"{record['enrage']}_{record['members'][0]['name']}_{record['killTimeSeconds']}"
    return hashlib.md5(id_string.encode()).hexdigest()

# -------------------------------
# COMPARE WITH EXISTING JSON
# -------------------------------
def find_new_records(new_records, existing_file_path):
    """Find records that exist in new_records but not in existing JSON file."""
    try:
        # Load existing data
        with open(existing_file_path, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        
        # Extract existing record IDs
        existing_ids = set()
        if "records" in existing_data:
            for record in existing_data["records"]:
                # If records already have _id field
                if "_id" in record:
                    existing_ids.add(record["_id"])
                else:
                    # Generate ID for existing records
                    existing_ids.add(generate_record_id(record))
        
        # Find new records
        new_only_records = []
        for record in new_records:
            if record["_id"] not in existing_ids:
                # Remove the _id field before output (if you don't want it in final JSON)
                record_without_id = {k: v for k, v in record.items() if k != "_id"}
                new_only_records.append(record_without_id)
        
        return new_only_records
        
    except FileNotFoundError:
        print(f"Existing file not found: {existing_file_path}")
        # If file doesn't exist, all records are new
        return [record for record in new_records if "_id" in record]

# -------------------------------
# MAIN EXECUTION
# -------------------------------
def filter_sheet(originalDataPath):
    print("Reading data from Google Sheet...")
    
    # Read data from Google Sheet
    df = read_google_sheet()
    
    if df.empty:
        print("No data found in the Google Sheet.")
        return
    
    print(f"Found {len(df)} rows in the sheet.")
    
    # Process data
    df = process_data(df)
    print(f"Processed {len(df)} valid rows.")
    
    # Build records
    records = build_records(df)
    print(f"Built {len(records)} records.")
    
    # Find new records compared to existing JSON
    new_records = find_new_records(records, originalDataPath)
    print(f"Found {len(new_records)} new records.")
    
    return new_records


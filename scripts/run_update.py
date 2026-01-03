from filter_data import save_json, filter_new_data
from datetime import datetime, timezone
from read_sheet import filter_sheet




if __name__ == "__main__":
    originalDataPath = "src/data/data.json"
    # originalDataPath = "scripts/data-testing.json"

    print(f"Enrage tracking started at: {datetime.now()}")
    newKills = filter_new_data(originalDataPath)
    print(f"Enrage tracking finished, saving data at: {datetime.now()}")
    save_json(originalDataPath, newKills)
    print(f"Data finished saving at: {datetime.now()}")
    print(f"Searching for records in sheet at: {datetime.now()}")
    newRecords = filter_sheet(originalDataPath)
    print(f"New records processed, saving data at: {datetime.now()}")
    save_json(originalDataPath, newRecords)
    print(f"Data finished saving at: {datetime.now()}")


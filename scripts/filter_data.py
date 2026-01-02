from fetch_api import fetch_json

from datetime import datetime, timezone
import time
import json
from pathlib import Path
from typing import List, Dict

def read_json(originalDataPath):
    OUTPUT = Path(originalDataPath)
    if OUTPUT.exists():
        data = json.loads(OUTPUT.read_text())
    else:
        data = {
            "meta": {},
            "records": []
        }

    enrageData = data["records"]

    return enrageData

def save_json(originalDataPath, newKills):
    OUTPUT = Path(originalDataPath)
    if OUTPUT.exists():
        data = json.loads(OUTPUT.read_text())
    else:
        data = {
            "meta": {},
            "records": []
        }
    
    for kill in newKills:
        data["records"].append(kill)
    
    data["records"] = sort_records_by_enrage_and_time(data)

    data["meta"] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "count": len(data["records"])
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, indent=2))


def get_personal_max(
    enrageData: List[Dict],
    name: str,
    metric: str = "enrage"
) -> Dict[str, Dict]:
    """
    Returns the record with the maximum value of `metric` for each member.

    Parameters:
    - enrageData: list of records, each record is a dict with keys 'enrage', 'killTimeSeconds', 'members', etc.
    - current_members: list of dicts, each with a 'name' key
    - metric: which field to use for max calculation ('enrage' or 'killTimeSeconds')

    Returns:
    - Dict mapping member name -> best record dict
    """
    personal_max_data = {}

    # Filter records where this member participated
    relevant_records = [
        record for record in enrageData
        if any(member["name"] == name for member in record.get("members", []))
    ]

    if not relevant_records:
        return  # skip if no records for this member

    # Find the record with maximum value for the given metric
    best_record = max(relevant_records, key=lambda r: r.get(metric, 0))

    personal_max_data[name] = best_record

    return personal_max_data[name]['enrage'], personal_max_data[name]['killTimeSeconds']


def sort_records_by_enrage_and_time(data: Dict) -> List[Dict]:
    return sorted(
        data.get("records", []),
        key=lambda r: (r.get("enrage", 0), r.get("timeOfKill", 0)),
        reverse=True
    )



def filter_data(originalDataPath):
    group_size = 1
    # Initialize lists to store results for each group size (2-5)
    enrage_data = {1: []}  # For storing highest enrage by group size
    
    # Define a function to manually set the date (this could be a dynamic extraction based on your needs)
    def get_manual_date(unix_kill_date):
        # return datetime.utcnow().strftime("%Y-%m-%d %H:%M")  # Returns today's date as a string in 'YYYY-MM-DD'
        return datetime.fromtimestamp(unix_kill_date, timezone.utc).strftime("%Y-%m-%d %H:%M")
    
    # Load existing data for enrage_data and specific_enrage_data
    # load_existing_data(main_file, enrage_data)
    enrageData = read_json(originalDataPath)

    main_members = sorted({
        member["name"]
        for record in enrageData
        for member in record.get("members", [])
    })
    
    data = fetch_json(group_size)
    if data != None:
        newKills = []
        # Iterate through the group data
        kills = data['content']

        # Iterate through kills to find the highest enrage
        for kill in kills:
            current_enrage = kill['enrage']
            current_unix_kill_date = kill['timeOfKill']
            current_member = kill['members']
            current_kill_time = kill['killTimeSeconds']
            
            # Check if the enrage involves any specific members
            for m in current_member:
                name = m['name']#.replace('\xa0', ' ')
                if name in main_members:
                    personal_max_enrage, personal_pr = get_personal_max(enrageData, name, metric="enrage")
                    if current_enrage > personal_max_enrage or (current_enrage == personal_max_enrage and personal_pr < current_kill_time):
                        newKill = {'enrage': current_enrage, 'timeOfKill': current_unix_kill_date, 'members': current_member, 'killTimeSeconds': current_kill_time}
                        newKills.append(newKill)

                else:
                    newKill = {'enrage': current_enrage, 'timeOfKill': current_unix_kill_date, 'members': current_member, 'killTimeSeconds': current_kill_time}
                    newKills.append(newKill)

    return newKills

if __name__ == "__main__":
    originalDataPath = "src/data/data.json"

    print(f"Enrage tracking started at: {datetime.now()}")
    newKills = filter_data(originalDataPath)
    print(f"Enrage tracking finished, saving data at: {datetime.now()}")
    save_json(originalDataPath, newKills)
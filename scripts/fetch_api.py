import requests #pip install requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def fetch_json(group_size):
    # Base URL for the API, with placeholders for groupSize and page
    url_base = "https://secure.runescape.com/m=group_hiscores/v1/groups?groupSize={groupSize}&size=15&bossId=1&page={page}"

    
    page = 0

    url = url_base.format(groupSize=group_size, page=page)

    retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retries)

    session = requests.session()
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    try:                
        # Send a GET request to fetch the data for the current page and group size
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        # Check if the request was successful
        if response.status_code == 200:
            # Parse the JSON content
            data = response.json()
        return data

    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')
        return None
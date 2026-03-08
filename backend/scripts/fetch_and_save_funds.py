"""
Script to fetch mutual funds data from external API and save locally
Run this once to download all fund data, then use it offline
"""
import requests
import json
import os

def fetch_and_save_funds():
    """Fetch funds from external API and save to JSON file"""
    try:
        print("Fetching mutual funds data from API...")
        response = requests.get('https://fundanalyzer.in/testcronpaymaa/testing/allcodes')
        data = response.json()
        
        # API returns status: 200 (not 'success')
        if data.get('status') == 200 or data.get('status') == 'success':
            # Save to JSON file in data directory
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            file_path = os.path.join(data_dir, 'mutual_funds.json')
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            fund_count = len(data.get('data', []))
            print(f"✓ Successfully saved {fund_count} mutual funds to {file_path}")
            print(f"\nYou can now use this data offline!")
            return True
        else:
            print(f"✗ API returned unexpected status: {data}")
            return False
            
    except Exception as e:
        print(f"✗ Error fetching data: {str(e)}")
        return False

if __name__ == '__main__':
    fetch_and_save_funds()

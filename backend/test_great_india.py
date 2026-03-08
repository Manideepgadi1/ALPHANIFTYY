import requests
import sys

def test_great_india():
    """Test Great India Basket (b14) Excel data"""
    
    url = "http://localhost:5000/api/baskets/b14/excel-performance?period=All"
    
    try:
        print("Testing Great India Basket (b14)...\n")
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            return False
            
        data = response.json()
        
        if not data.get('success'):
            print(f"❌ Response not successful")
            print(data)
            return False
            
        performance = data.get('data', [])
        
        if not performance:
            print("❌ No performance data returned")
            return False
            
        print(f"✅ Great India Basket (b14)")
        print(f"Total data points: {len(performance)}\n")
        
        # Show last 3 data points
        print("📊 Last 3 data points:")
        for point in performance[-3:]:
            print(f"  {point['label']:15} | Date: {point['date']} | NAV: {point['basketValue']}")
        
        # Check last data point
        last_point = performance[-1]
        print(f"\n🎯 LAST DATA:")
        print(f"   Date: {last_point['date']}")
        print(f"   Basket NAV: {last_point['basketValue']}")
        
        # Verify it matches expected data (Jan 21, 2026, NAV ~1063.99)
        if last_point['date'] == '2026-01-21' and 1063 < last_point['basketValue'] < 1065:
            print(f"\n✅ CORRECT! Using the great india basket.xlsx")
            return True
        else:
            print(f"\n❌ WRONG! Expected 2026-01-21 with NAV ~1063.99")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_great_india()
    sys.exit(0 if success else 1)

import re

# Read the file
with open('mock_data.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Define average returns for each basket
averageReturns = {
    'b4': 12,   # Yellow Basket
    'b9': 25,   # Premium Aggressive (already added)
    'b10': 20,  # Conservative Balanced (already added)
    'b11': 11,  # White Basket
    'b12': 16,  # Every Common India
    'b13': 15,  # The Great India
    'b14': 14,  # Balanced Basket
    'b15': 13,  # Dusshera Basket
    'b16': 24,  # Sankranti Premium (already added)
    'b17': 22,  # Premium BALANCED (already added)
    'b18': 20,  # Premium Conservative (already added)
    'b1': 18,   # Green Basket
    'b2': 17,   # Blue Basket
    'b3': 16,   # Red Basket
    'b6': 17,   # Sector Rotation
    'b7': 15,   # Tax Saver
    'b8': 19,   # Momentum
}

# For each basket, add averageReturn if not already present
for basket_id, avg_return in averageReturns.items():
    # Find the basket section
    pattern = rf"('id':\s*'{basket_id}',.*?)'riskPercentage':"
    
    def add_average_return(match):
        basket_section = match.group(1)
        # Check if averageReturn already exists
        if "'averageReturn':" in basket_section:
            return match.group(0)  # Already has it, skip
        
        # Find the cagr5Y line
        cagr_pattern = r"('cagr5Y':\s*[\d.]+,)\s*\n"
        cagr_match = re.search(cagr_pattern, basket_section)
        if cagr_match:
            # Add averageReturn after cagr5Y
            new_section = basket_section.replace(
                cagr_match.group(1),
                cagr_match.group(1) + f"\n        'averageReturn': {avg_return},"
            )
            return new_section + "'riskPercentage':"
        return match.group(0)
    
    content = re.sub(pattern, add_average_return, content, flags=re.DOTALL)

# Write back
with open('mock_data.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Average returns added successfully!")
print(f"Updated baskets: {list(averageReturns.keys())}")

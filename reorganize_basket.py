import re

# Read the file
with open(r"D:\VSFintech-Platform\Alphanifty\src\pages\BasketDetailsPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the render section start
render_start = content.find("/* ================= RENDER ================= */")
before_render = content[:render_start + len("/* ================= RENDER ================= */\n")]

# Find the header section end (after </div> closing the card)
header_pattern = r"(</div>\s*</div>\s*</div>\s*\n\s*)\n\s*{/\* Performance Chart \*/}"
header_match = re.search(header_pattern, content[render_start:])
if header_match:
    header_end_pos = render_start + header_match.start() + len(header_match.group(1))
    header_section = content[render_start:header_end_pos]
else:
    print("Could not find header end")
    exit()

# Extract sections
def extract_section(start_comment, end_marker=None):
    start_idx = content.find(start_comment)
    if start_idx == -1:
        return None, -1, -1
    
    # Find the closing of this section
    if end_marker:
        end_idx = content.find(end_marker, start_idx)
    else:
        # Find next section or end of file
        next_comment_idx = content.find("\n        {/*", start_idx + len(start_comment))
        export_idx = content.find("\nexport default", start_idx)
        end_idx = min(i for i in [next_comment_idx, export_idx] if i > start_idx)
    
    return content[start_idx:end_idx], start_idx, end_idx

# Extract About section
about_section, about_start, about_end = extract_section("{/* About This Basket */}")

# Extract Risk Metrics
risk_section, risk_start, risk_end = extract_section("{/* Risk Metrics */}")

# Extract Investment Calculator  
calc_section, calc_start, calc_end = extract_section("{/* Investment Calculator */}")

# Extract Performance Chart
perf_section, perf_start, perf_end = extract_section("{/* Performance Chart */}")

print(f"About: {about_start} to {about_end}")
print(f"Risk: {risk_start} to {risk_end}")
print(f"Calc: {calc_start} to {calc_end}")
print(f"Perf: {perf_start} to {perf_end}")

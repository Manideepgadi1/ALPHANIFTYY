#!/usr/bin/env python3
import re

# Read the file
with open(r"D:\VSFintech-Platform\Alphanifty\src\pages\BasketDetailsPage.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Section line numbers (0-indexed, so subtract 1)
sections = {
    "header_end": 282,
    "perf_start": 282,
    "perf_end": 388,
    "sector_start": 388,
    "sector_end": 455,
    "equity_start": 455,
    "equity_end": 482,
    "debt_start": 482,
    "debt_end": 511,
    "about_start": 511,
    "about_end": 560,
    "goals_start": 560,
    "goals_end": 577,
    "risk_start": 577,
    "risk_end": 611,
    "calc_start": 611,
}

# Extract sections
header = "".join(lines[:sections["header_end"]])
about = "".join(lines[sections["about_start"]:sections["about_end"]])
risk = "".join(lines[sections["risk_start"]:sections["risk_end"]])
calc = "".join(lines[sections["calc_start"]:-2])  # -2 to exclude closing braces
perf = "".join(lines[sections["perf_start"]:sections["perf_end"]])
sector = "".join(lines[sections["sector_start"]:sections["sector_end"]])
equity = "".join(lines[sections["equity_start"]:sections["equity_end"]])
debt = "".join(lines[sections["debt_start"]:sections["debt_end"]])
goals = "".join(lines[sections["goals_start"]:sections["goals_end"]])
footer = "".join(lines[-2:])  # Last 2 lines

# Make equity and debt collapsible
equity_collapsible = equity.replace(
    '{/* Equity Holdings */}',
    '''{/* Equity Holdings */}'''
).replace(
    '<div className="card p-6 mb-6">',
    '''<div className="card p-6 mb-6">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setEquityExpanded(!equityExpanded)}
              >'''
).replace(
    '<h2 className="text-xl font-bold mb-4">Equity Holdings</h2>',
    '''<h2 className="text-xl font-bold">Equity Holdings</h2>
                {equityExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {equityExpanded && (
                <>'''
).replace(
    '</div>\n              </div>\n            )}',
    '''</div>
                </>
              )}
            </div>
          )}'''
)

debt_collapsible = debt.replace(
    '{/* Debt Holdings */}',
    '''{/* Debt Holdings */}'''
).replace(
    '<div className="card p-6 mb-6">',
    '''<div className="card p-6 mb-6">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setDebtExpanded(!debtExpanded)}
              >'''
).replace(
    '<h2 className="text-xl font-bold mb-4">Debt Holdings</h2>',
    '''<h2 className="text-xl font-bold">Debt Holdings</h2>
                {debtExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {debtExpanded && (
                <>'''
).replace(
    '</div>\n              </div>\n            )}',
    '''</div>
                </>
              )}
            </div>
          )}'''
)

# Reorganize
new_content = (
    header + "\n" +
    about + "\n" +
    risk + "\n" +
    calc + "\n" +
    perf + "\n" +
    sector + "\n" +
    equity_collapsible + "\n" +
    debt_collapsible + "\n" +
    goals + "\n" +
    footer
)

# Write the new file
with open(r"D:\VSFintech-Platform\Alphanifty\src\pages\BasketDetailsPage.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("✅ File reorganized successfully!")
print("New order:")
print("1. Header")
print("2. About This Basket")
print("3. Risk Metrics")
print("4. Investment Calculator")
print("5. Performance Chart")
print("6. Sector/Fund Allocation")
print("7. Equity Holdings (collapsible)")
print("8. Debt Holdings (collapsible)")
print("9. Investment Goals")

# Read the file
$file = "D:\VSFintech-Platform\Alphanifty\src\pages\BasketDetailsPage.tsx"
$content = Get-Content $file -Raw

# Find and extract sections using regex
$aboutSection = [regex]::Match($content, '(?s)(/\* About This Basket \*/.*?</div>\s*</div>\s*\)\s*\}\s*\n\s*(?=/\*|{/\* Investment Goals)|$)').Value
$riskMetricsSection = [regex]::Match($content, '(?s)(/\* Risk Metrics \*/.*?</div>\s*</div>\s*\)\s*\}\s*\n\s*(?=/\*|{/\* Investment Calculator)|$)').Value
$investmentCalcSection = [regex]::Match($content, '(?s)(/\* Investment Calculator \*/.*?</div>\s*</div>\s*\n\s*(?=/\*|{/\* Top Holdings \*)|</div>\s*\)\s*;\s*\};\s*export default)').Value

Write-Host "About Section Length: $($aboutSection.Length)"
Write-Host "Risk Metrics Length: $($riskMetricsSection.Length)"
Write-Host "Investment Calc Length: $($investmentCalcSection.Length)"

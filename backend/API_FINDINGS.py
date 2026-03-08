"""
ACCORD API DATA AVAILABILITY - FINDINGS

====================================================================
KEY FINDINGS:
====================================================================

1. INCREMENTAL API BEHAVIOR:
   - Accord API is INCREMENTAL - returns 204 (No Content) if no changes on that date
   - You CANNOT just query "today" and get all data
   - You must query dates when data was actually added/updated

2. AVAILABLE SCHEMES:
   Latest complete data: 14-Apr-2024 (14042024)
   Total schemes: 334 schemes
   
   Other dates found:
   - 11-Sep-2024: 36 schemes (partial update)
   - 26-Jul-2024: 114 schemes (partial update)  
   - 30-Sep-2022: 329 schemes (our old test date)

3. NAV DATA AVAILABILITY:
   For date 14042024:
   - 979 NAV records
   - NAV dates: 06-Apr-2024 to 14-Apr-2024 (8 days of data)
   
   This means:
   - When you query Navhist with date=14042024
   - You get NAV records from Apr 6-14, 2024
   - NOT just April 14th!

4. HOW THE API WORKS:
   
   Scheme_master:
   - Returns NEW/UPDATED schemes on that date
   - flag='A' means Added/Updated
   - flag='D' means Deleted
   
   Navhist:
   - Returns NAV records added/updated on that date
   - Contains multiple days of NAV data
   - Each record has: schemecode, navdate, navrs (NAV value)
   
   Currentnav:
   - Returns LATEST NAV as of that date
   - One record per scheme

5. TO GET COMPLETE DATA:
   
   You need to:
   a) Call multiple dates and merge results
   b) OR use the latest "full dump" date
   c) OR maintain your own database with incremental updates
   
   Example:
   - Query 14042024: Get 334 schemes + NAVs from Apr 6-14
   - Query 11092024: Get 36 more schemes + NAVs from Sep 11
   - Merge both to get ~370 total schemes

====================================================================
ANSWER TO YOUR QUESTIONS:
====================================================================

Q: Only 329 schemes? How many funds are there?

A: Accord API has LIMITED mutual funds in their Raw Data API:
   - 14-Apr-2024: 334 schemes (latest complete)
   - 30-Sep-2022: 329 schemes (our test date)
   - 11-Sep-2024: 36 schemes (incremental update)
   
   This is MUCH LESS than your Excel (10,055 funds) because:
   - Accord may not have all funds
   - Accord Raw Data API is for DATA VENDORS (not retail)
   - Your Excel likely has AMFI data (all India MF schemes)

Q: What is the NAV date which I will get from the API?

A: When you query Navhist with a date like 14042024:
   - You get NAV records ADDED on that date
   - Example: 979 records covering Apr 6-14, 2024
   - Each record has 'navdate' field showing actual NAV date
   
   Structure:
   {
     "schemecode": "225",
     "navdate": "2024-04-14 00:00:00.000",  <- Actual NAV date
     "navrs": "18.5432",  <- NAV value
     "adjustednav_c": "18.5432",
     "flag": "A"  <- A=Added, O=Updated
   }

====================================================================
RECOMMENDATION:
====================================================================

Since Accord only has ~334 schemes:

OPTION 1: Use Accord data only (334 schemes)
- Create accord_schemes_latest.xlsx (done ✓)
- Use date: 14042024
- Get NAV data from Apr 2024
- Limited to 334 funds

OPTION 2: Contact Accord support
- Ask: How to get FULL scheme list?
- Ask: How to get CURRENT/LATEST data?
- Ask: Do they have more schemes than 334?

OPTION 3: Use different API
- AMFI API (has all ~10,000 funds)
- MFCentral API
- Direct AMC APIs

OPTION 4: Hybrid approach
- Use your Excel (10,055 funds) for scheme list
- Try to match to Accord codes
- Fall back to other API for missing funds

====================================================================
"""
print(__doc__)

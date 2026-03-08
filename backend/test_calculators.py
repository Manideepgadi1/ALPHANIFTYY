"""
Calculator Service Test Suite
==============================
Test cases to verify the accuracy of all financial calculations.
Run this file to validate calculator formulas.

Usage:
    python test_calculators.py
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from calculator_service import (
    FinancialCalculator, 
    sip_calculator, 
    lumpsum_calculator, 
    goal_calculator
)


def test_sip_calculator():
    """Test SIP calculations"""
    print("\n=== Testing SIP Calculator ===")
    
    # Test 1: Basic SIP calculation
    print("\nTest 1: ₹5,000/month @ 12% for 10 years")
    result = sip_calculator(5000, 12, 10)
    print(f"  Invested: ₹{result['investedAmount']:,.2f}")
    print(f"  Returns: ₹{result['estimatedReturns']:,.2f}")
    print(f"  Total Value: ₹{result['totalValue']:,.2f}")
    
    # Manual verification: FV = P * [((1+r)^n - 1) / r] * (1+r)
    # P = 5000, r = 0.12/12 = 0.01, n = 120
    # FV = 5000 * [((1.01)^120 - 1) / 0.01] * 1.01
    # FV = 11,61,695.38
    expected_fv = 1161695.38
    tolerance = 1.0  # ±₹1
    assert abs(result['totalValue'] - expected_fv) < tolerance, \
        f"SIP calculation mismatch! Expected ~{expected_fv}, got {result['totalValue']}"
    print("  ✓ Passed")
    
    # Test 2: Zero return rate
    print("\nTest 2: ₹1,000/month @ 0% for 5 years")
    result = sip_calculator(1000, 0, 5)
    print(f"  Invested: ₹{result['investedAmount']:,.2f}")
    print(f"  Returns: ₹{result['estimatedReturns']:,.2f}")
    print(f"  Total Value: ₹{result['totalValue']:,.2f}")
    assert result['totalValue'] == 60000, "Zero return should equal invested amount"
    print("  ✓ Passed")
    
    # Test 3: Chart data generation
    print("\nTest 3: Chart data verification")
    result = sip_calculator(5000, 12, 3)
    assert len(result['chartData']) == 3, "Should have 3 years of data"
    assert result['chartData'][0]['year'] == 1, "First entry should be year 1"
    assert result['chartData'][2]['year'] == 3, "Last entry should be year 3"
    print(f"  Year 1 Value: ₹{result['chartData'][0]['value']:,.2f}")
    print(f"  Year 2 Value: ₹{result['chartData'][1]['value']:,.2f}")
    print(f"  Year 3 Value: ₹{result['chartData'][2]['value']:,.2f}")
    print("  ✓ Passed")


def test_lumpsum_calculator():
    """Test Lumpsum calculations"""
    print("\n=== Testing Lumpsum Calculator ===")
    
    # Test 1: Basic lumpsum calculation
    print("\nTest 1: ₹1,00,000 @ 12% for 10 years")
    result = lumpsum_calculator(100000, 12, 10)
    print(f"  Invested: ₹{result['investedAmount']:,.2f}")
    print(f"  Returns: ₹{result['estimatedReturns']:,.2f}")
    print(f"  Total Value: ₹{result['totalValue']:,.2f}")
    
    # Manual verification: FV = P * (1+r)^n
    # P = 100000, r = 0.12, n = 10
    # FV = 100000 * (1.12)^10 ≈ 3,10,584.82
    expected_fv = 310584.82
    tolerance = 1.0
    assert abs(result['totalValue'] - expected_fv) < tolerance, \
        f"Lumpsum calculation mismatch! Expected ~{expected_fv}, got {result['totalValue']}"
    print("  ✓ Passed")
    
    # Test 2: Double your money rule (Rule of 72)
    print("\nTest 2: Doubling time verification @ 12% (should be ~6 years)")
    result = lumpsum_calculator(100000, 12, 6)
    print(f"  After 6 years: ₹{result['totalValue']:,.2f}")
    # Should be close to double (₹2,00,000)
    assert 195000 < result['totalValue'] < 205000, "Should approximately double"
    print("  ✓ Passed")
    
    # Test 3: Chart data year-over-year growth
    print("\nTest 3: Chart data progression")
    result = lumpsum_calculator(50000, 10, 5)
    for i, year_data in enumerate(result['chartData']):
        print(f"  Year {year_data['year']}: ₹{year_data['value']:,.2f}")
        if i > 0:
            # Each year should have higher value
            assert year_data['value'] > result['chartData'][i-1]['value'], \
                "Value should increase year over year"
    print("  ✓ Passed")


def test_goal_calculator():
    """Test Goal-based investment calculations"""
    print("\n=== Testing Goal Calculator ===")
    
    # Test 1: Goal without existing investment
    print("\nTest 1: Target ₹50,00,000 in 15 years @ 12%")
    result = goal_calculator(5000000, 15, 12, 0)
    print(f"  Required Monthly SIP: ₹{result['requiredMonthlySIP']:,.2f}")
    print(f"  Future Value of Existing: ₹{result['futureValueOfExisting']:,.2f}")
    print(f"  Additional Required: ₹{result['additionalRequired']:,.2f}")
    
    # Verify: Given the required SIP, check if it actually reaches the target
    verify_sip = sip_calculator(result['requiredMonthlySIP'], 12, 15)
    tolerance = 1000  # ±₹1000 for rounding
    assert abs(verify_sip['totalValue'] - 5000000) < tolerance, \
        f"Goal SIP doesn't reach target! Target: 5000000, Reached: {verify_sip['totalValue']}"
    print("  ✓ Passed")
    
    # Test 2: Goal with existing investment
    print("\nTest 2: Target ₹30,00,000 in 10 years @ 12% with ₹5,00,000 existing")
    result = goal_calculator(3000000, 10, 12, 500000)
    print(f"  Required Monthly SIP: ₹{result['requiredMonthlySIP']:,.2f}")
    print(f"  Future Value of Existing: ₹{result['futureValueOfExisting']:,.2f}")
    print(f"  Additional Required: ₹{result['additionalRequired']:,.2f}")
    
    # Existing + SIP should reach target
    existing_fv = lumpsum_calculator(500000, 12, 10)['totalValue']
    sip_fv = sip_calculator(result['requiredMonthlySIP'], 12, 10)['totalValue']
    total_fv = existing_fv + sip_fv
    assert abs(total_fv - 3000000) < 1000, \
        f"Combined investment doesn't reach target! Target: 3000000, Reached: {total_fv}"
    print("  ✓ Passed")
    
    # Test 3: Existing investment already sufficient
    print("\nTest 3: Target ₹10,00,000 in 10 years @ 12% with ₹5,00,000 existing")
    result = goal_calculator(1000000, 10, 12, 500000)
    print(f"  Required Monthly SIP: ₹{result['requiredMonthlySIP']:,.2f}")
    print(f"  Future Value of Existing: ₹{result['futureValueOfExisting']:,.2f}")
    
    # Should require no SIP (existing is sufficient)
    existing_fv = lumpsum_calculator(500000, 12, 10)['totalValue']
    if existing_fv >= 1000000:
        assert result['requiredMonthlySIP'] == 0, "Should not require additional SIP"
        print("  ✓ Passed - Existing investment is sufficient")
    else:
        print(f"  ✓ Passed - Requires SIP: ₹{result['requiredMonthlySIP']:,.2f}")
    
    # Test 4: Chart data breakdown
    print("\nTest 4: Chart data verification")
    result = goal_calculator(2000000, 10, 12, 200000)
    print(f"  Chart - Existing FV: ₹{result['chartData']['existing']:,.2f}")
    print(f"  Chart - SIP FV: ₹{result['chartData']['sip']:,.2f}")
    print(f"  Chart - Target: ₹{result['chartData']['target']:,.2f}")
    print(f"  Combined: ₹{result['chartData']['existing'] + result['chartData']['sip']:,.2f}")
    
    # Chart data should show future values that sum to target
    total = result['chartData']['existing'] + result['chartData']['sip']
    assert abs(total - result['chartData']['target']) < 10, \
        f"Chart components don't sum to target! Target: {result['chartData']['target']}, Sum: {total}"
    print("  ✓ Passed")


def test_edge_cases():
    """Test edge cases and input validation"""
    print("\n=== Testing Edge Cases ===")
    
    # Test 1: Very small investment
    print("\nTest 1: Minimum investment ₹100/month")
    result = sip_calculator(100, 12, 5)
    assert result['totalValue'] > result['investedAmount'], "Should have positive returns"
    print(f"  Total Value: ₹{result['totalValue']:,.2f}")
    print("  ✓ Passed")
    
    # Test 2: Very high return rate
    print("\nTest 2: High return rate 25%")
    result = sip_calculator(5000, 25, 10)
    print(f"  Total Value: ₹{result['totalValue']:,.2f}")
    assert result['totalValue'] > result['investedAmount'] * 2, "High return should multiply value"
    print("  ✓ Passed")
    
    # Test 3: Single year investment
    print("\nTest 3: Single year investment")
    result = sip_calculator(10000, 12, 1)
    print(f"  Total Value: ₹{result['totalValue']:,.2f}")
    assert result['investedAmount'] == 120000, "Should invest ₹1,20,000 in one year"
    print("  ✓ Passed")
    
    # Test 4: Large amounts (in crores)
    print("\nTest 4: Large investment ₹1,00,000/month")
    result = sip_calculator(100000, 12, 10)
    print(f"  Total Value: ₹{result['totalValue']:,.2f} ({result['totalValue']/10000000:.2f} Cr)")
    assert result['totalValue'] > 10000000, "Should exceed 1 crore"
    print("  ✓ Passed")


def run_all_tests():
    """Run all test suites"""
    print("\n" + "="*60)
    print(" FINANCIAL CALCULATOR TEST SUITE")
    print("="*60)
    
    try:
        test_sip_calculator()
        test_lumpsum_calculator()
        test_goal_calculator()
        test_edge_cases()
        
        print("\n" + "="*60)
        print(" ✓ ALL TESTS PASSED!")
        print("="*60)
        print("\nThe calculator formulas are mathematically accurate.")
        print("Backend calculations are verified and ready to use.\n")
        
    except AssertionError as e:
        print("\n" + "="*60)
        print(" ✗ TEST FAILED!")
        print("="*60)
        print(f"\nError: {e}\n")
        sys.exit(1)
    except Exception as e:
        print("\n" + "="*60)
        print(" ✗ TEST ERROR!")
        print("="*60)
        print(f"\nUnexpected error: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()

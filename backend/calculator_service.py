"""
Financial Calculator Service
============================
Accurate financial calculations for SIP, Lumpsum, and Goal-based investments.
All formulas are mathematically verified and follow standard financial practices.

Author: AlphaNifty
Date: February 2026
"""

import math
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class SIPResult:
    """Result for SIP calculations"""
    invested_amount: float
    estimated_returns: float
    total_value: float
    monthly_investment: float
    annual_return: float
    years: int
    chart_data: List[Dict[str, float]]


@dataclass
class LumpsumResult:
    """Result for Lumpsum calculations"""
    invested_amount: float
    estimated_returns: float
    total_value: float
    principal: float
    annual_return: float
    years: int
    chart_data: List[Dict[str, float]]


@dataclass
class GoalResult:
    """Result for Goal calculations"""
    required_monthly_sip: float
    target_amount: float
    years: int
    existing_investment: float
    future_value_of_existing: float
    additional_required: float
    chart_data: Dict[str, float]


class FinancialCalculator:
    """
    Financial Calculator with accurate formulas
    """
    
    @staticmethod
    def calculate_sip(monthly_investment: float, 
                     annual_return: float, 
                     years: int) -> SIPResult:
        """
        Calculate SIP (Systematic Investment Plan) returns
        
        Formula: FV = P × [{(1 + r)^n - 1} / r] × (1 + r)
        Where:
            P = Monthly investment
            r = Monthly rate of return (annual_return / 12 / 100)
            n = Number of months (years × 12)
        
        Args:
            monthly_investment: Monthly investment amount in rupees
            annual_return: Expected annual return in percentage (e.g., 12 for 12%)
            years: Investment period in years
            
        Returns:
            SIPResult with all calculated values and chart data
        """
        if monthly_investment <= 0:
            raise ValueError("Monthly investment must be greater than 0")
        if annual_return < 0:
            raise ValueError("Annual return cannot be negative")
        if years <= 0:
            raise ValueError("Years must be greater than 0")
        
        # Convert annual return to monthly rate
        monthly_rate = annual_return / 12 / 100
        months = years * 12
        
        # Calculate future value using SIP formula
        if monthly_rate > 0:
            # Standard SIP formula with compounding
            future_value = monthly_investment * (
                ((math.pow(1 + monthly_rate, months) - 1) / monthly_rate) * 
                (1 + monthly_rate)
            )
        else:
            # If no return, just sum up investments
            future_value = monthly_investment * months
        
        invested_amount = monthly_investment * months
        estimated_returns = future_value - invested_amount
        
        # Generate year-wise chart data
        chart_data = []
        for year in range(1, years + 1):
            m = year * 12
            if monthly_rate > 0:
                value = monthly_investment * (
                    ((math.pow(1 + monthly_rate, m) - 1) / monthly_rate) * 
                    (1 + monthly_rate)
                )
            else:
                value = monthly_investment * m
            
            chart_data.append({
                'year': year,
                'invested': monthly_investment * m,
                'value': value,
                'returns': value - (monthly_investment * m)
            })
        
        return SIPResult(
            invested_amount=round(invested_amount, 2),
            estimated_returns=round(estimated_returns, 2),
            total_value=round(future_value, 2),
            monthly_investment=monthly_investment,
            annual_return=annual_return,
            years=years,
            chart_data=chart_data
        )
    
    @staticmethod
    def calculate_lumpsum(principal: float, 
                         annual_return: float, 
                         years: int) -> LumpsumResult:
        """
        Calculate Lumpsum investment returns
        
        Formula: FV = P × (1 + r)^n
        Where:
            P = Principal amount
            r = Annual rate of return (annual_return / 100)
            n = Number of years
        
        Args:
            principal: One-time investment amount in rupees
            annual_return: Expected annual return in percentage
            years: Investment period in years
            
        Returns:
            LumpsumResult with all calculated values and chart data
        """
        if principal <= 0:
            raise ValueError("Principal must be greater than 0")
        if annual_return < 0:
            raise ValueError("Annual return cannot be negative")
        if years <= 0:
            raise ValueError("Years must be greater than 0")
        
        # Compound interest formula
        annual_rate = annual_return / 100
        future_value = principal * math.pow(1 + annual_rate, years)
        
        estimated_returns = future_value - principal
        
        # Generate year-wise chart data
        chart_data = []
        for year in range(1, years + 1):
            value = principal * math.pow(1 + annual_rate, year)
            chart_data.append({
                'year': year,
                'invested': principal,
                'value': value,
                'returns': value - principal
            })
        
        return LumpsumResult(
            invested_amount=round(principal, 2),
            estimated_returns=round(estimated_returns, 2),
            total_value=round(future_value, 2),
            principal=principal,
            annual_return=annual_return,
            years=years,
            chart_data=chart_data
        )
    
    @staticmethod
    def calculate_goal_based_investment(target_amount: float, 
                                       years: int, 
                                       annual_return: float,
                                       existing_investment: float = 0) -> GoalResult:
        """
        Calculate required monthly SIP to achieve a financial goal
        
        Steps:
        1. Calculate future value of existing investment
        2. Determine remaining amount needed
        3. Calculate required monthly SIP using reverse SIP formula
        
        Formula for required SIP: P = FV × r / [{(1 + r)^n - 1} × (1 + r)]
        Where:
            FV = Future value needed (remaining after existing investment)
            r = Monthly rate of return
            n = Number of months
        
        Args:
            target_amount: Target amount to be achieved
            years: Time period to achieve the goal
            annual_return: Expected annual return percentage
            existing_investment: Already invested amount (optional)
            
        Returns:
            GoalResult with required SIP and breakdown
        """
        if target_amount <= 0:
            raise ValueError("Target amount must be greater than 0")
        if years <= 0:
            raise ValueError("Years must be greater than 0")
        if annual_return < 0:
            raise ValueError("Annual return cannot be negative")
        if existing_investment < 0:
            raise ValueError("Existing investment cannot be negative")
        
        # Calculate future value of existing investment
        annual_rate = annual_return / 100
        future_value_existing = existing_investment * math.pow(1 + annual_rate, years)
        
        # Calculate remaining amount needed
        remaining_amount = target_amount - future_value_existing
        
        # If existing investment is sufficient
        if remaining_amount <= 0:
            return GoalResult(
                required_monthly_sip=0,
                target_amount=target_amount,
                years=years,
                existing_investment=existing_investment,
                future_value_of_existing=round(future_value_existing, 2),
                additional_required=0,
                chart_data={
                    'existing': round(future_value_existing, 2),
                    'sip': 0,
                    'target': target_amount
                }
            )
        
        # Calculate required monthly SIP
        monthly_rate = annual_return / 12 / 100
        months = years * 12
        
        if monthly_rate > 0:
            # Reverse SIP formula to find required monthly payment
            required_sip = remaining_amount * monthly_rate / (
                (math.pow(1 + monthly_rate, months) - 1) * (1 + monthly_rate)
            )
        else:
            # If no return, simple division
            required_sip = remaining_amount / months
        
        # Calculate future value of the required SIP for verification
        if monthly_rate > 0:
            sip_future_value = required_sip * (
                ((math.pow(1 + monthly_rate, months) - 1) / monthly_rate) * 
                (1 + monthly_rate)
            )
        else:
            sip_future_value = required_sip * months
        
        return GoalResult(
            required_monthly_sip=round(required_sip, 2),
            target_amount=target_amount,
            years=years,
            existing_investment=existing_investment,
            future_value_of_existing=round(future_value_existing, 2),
            additional_required=round(remaining_amount, 2),
            chart_data={
                'existing': round(future_value_existing, 2),
                'sip': round(sip_future_value, 2),  # Future value of SIP, not invested amount
                'target': target_amount
            }
        )
    
    @staticmethod
    def validate_inputs(investment: float, 
                       return_rate: float, 
                       time_period: int,
                       input_name: str = "Investment") -> Dict[str, str]:
        """
        Validate calculator inputs
        
        Returns:
            Dict with 'valid' (bool) and 'errors' (list of error messages)
        """
        errors = []
        
        if investment <= 0:
            errors.append(f"{input_name} must be greater than 0")
        if investment > 1e10:  # 10 billion limit
            errors.append(f"{input_name} is too large (max: ₹10,00,00,00,000)")
        
        if return_rate < 0:
            errors.append("Return rate cannot be negative")
        if return_rate > 100:
            errors.append("Return rate seems unrealistic (max: 100%)")
        
        if time_period <= 0:
            errors.append("Time period must be greater than 0")
        if time_period > 50:
            errors.append("Time period is too long (max: 50 years)")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }


# Convenience functions for API usage
def sip_calculator(monthly_investment: float, annual_return: float, years: int) -> Dict:
    """Wrapper for SIP calculation - returns dict for JSON serialization"""
    calc = FinancialCalculator()
    result = calc.calculate_sip(monthly_investment, annual_return, years)
    return {
        'investedAmount': result.invested_amount,
        'estimatedReturns': result.estimated_returns,
        'totalValue': result.total_value,
        'chartData': result.chart_data
    }


def lumpsum_calculator(principal: float, annual_return: float, years: int) -> Dict:
    """Wrapper for Lumpsum calculation - returns dict for JSON serialization"""
    calc = FinancialCalculator()
    result = calc.calculate_lumpsum(principal, annual_return, years)
    return {
        'investedAmount': result.invested_amount,
        'estimatedReturns': result.estimated_returns,
        'totalValue': result.total_value,
        'chartData': result.chart_data
    }


def goal_calculator(target_amount: float, years: int, annual_return: float, 
                   existing_investment: float = 0) -> Dict:
    """Wrapper for Goal calculation - returns dict for JSON serialization"""
    calc = FinancialCalculator()
    result = calc.calculate_goal_based_investment(
        target_amount, years, annual_return, existing_investment
    )
    return {
        'requiredMonthlySIP': result.required_monthly_sip,
        'targetAmount': result.target_amount,
        'years': result.years,
        'existingInvestment': result.existing_investment,
        'futureValueOfExisting': result.future_value_of_existing,
        'additionalRequired': result.additional_required,
        'chartData': result.chart_data
    }

"""
Screening service for calculating tenant application scores
"""

from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import random

def calculate_screening_score(
    credit_score: Optional[int],
    monthly_income: Optional[float],
    monthly_rent: float,
    min_credit_score: int = 600,
    income_multiplier: float = 3.0,
    min_income_multiplier: float = 2.5
) -> tuple[str, str]:
    """
    Calculate screening score (green/yellow/red) based on credit score and income only
    
    Returns:
        (score, notes) where score is "green", "yellow", or "red"
    """
    notes_parts = []
    
    # Check credit score
    if credit_score is None:
        notes_parts.append("Credit score not provided")
        return "red", "; ".join(notes_parts)
    
    credit_ok = credit_score >= min_credit_score
    if not credit_ok:
        notes_parts.append(f"Credit score {credit_score} below minimum {min_credit_score}")
    
    # Check income
    if monthly_income is None:
        notes_parts.append("Income information not provided")
        return "red", "; ".join(notes_parts)
    
    income_ratio = monthly_income / monthly_rent if monthly_rent > 0 else 0
    income_sufficient_high = monthly_income >= (monthly_rent * income_multiplier)
    income_sufficient_low = monthly_income >= (monthly_rent * min_income_multiplier)
    
    if not income_sufficient_low:
        notes_parts.append(f"Income ${monthly_income:,.2f}/month insufficient (rent is ${monthly_rent:,.2f}/month, need at least ${monthly_rent * min_income_multiplier:,.2f}/month)")
    
    # Determine score - only based on credit and income
    # Green: credit >= 680, income >= rent * 3
    if credit_score >= 680 and income_sufficient_high:
        score = "green"
        if not notes_parts:
            notes_parts.append(f"Excellent credit ({credit_score}) and sufficient income ({income_ratio:.2f}x rent)")
    # Yellow: credit >= 600, income >= rent * 2.5
    elif credit_score >= min_credit_score and income_sufficient_low:
        score = "yellow"
        if credit_score < 680:
            notes_parts.append(f"Credit score {credit_score} is good but below 680")
        if not income_sufficient_high:
            notes_parts.append(f"Income ratio is {income_ratio:.2f}x (target: {income_multiplier}x)")
    else:
        score = "red"
    
    notes = "; ".join(notes_parts) if notes_parts else "Screening complete"
    return score, notes

def validate_license_expiration(expiration_date: Optional[datetime]) -> bool:
    """Check if license is valid (not expired and not expiring within 30 days)"""
    if expiration_date is None:
        return False
    
    today = datetime.now().date()
    expiration = expiration_date.date() if isinstance(expiration_date, datetime) else expiration_date
    
    if expiration < today:
        return False  # Expired
    
    days_until_expiration = (expiration - today).days
    if days_until_expiration < 30:
        return False  # Expiring within 30 days
    
    return True

def run_background_check(
    applicant_name: str,
    applicant_email: str,
    applicant_phone: Optional[str] = None,
    license_number: Optional[str] = None,
    dob: Optional[datetime] = None,
    employer_name: Optional[str] = None,
    credit_score: Optional[int] = None
) -> Dict[str, Any]:
    """
    Mock background check service for demo purposes.
    Generates realistic-looking background check results.
    
    Returns a dictionary with background check results including:
    - criminal_history: dict with status, records, details
    - eviction_history: dict with status, records
    - employment_verification: dict with status, details
    - identity_verification: dict with status, details
    - overall_status: "pass", "review", or "fail"
    - report_id: mock report ID
    - completed_at: timestamp
    """
    # Generate deterministic results based on name hash for consistency
    name_hash = hash(applicant_name.lower().strip()) % 100
    
    # Criminal history check
    if name_hash < 5:  # 5% fail rate for demo
        criminal_status = "fail"
        criminal_records = [
            {
                "date": "2018-03-15",
                "offense": "Minor traffic violation",
                "status": "Resolved",
                "severity": "low"
            }
        ]
    elif name_hash < 15:  # 10% review rate
        criminal_status = "review"
        criminal_records = [
            {
                "date": "2020-06-20",
                "offense": "Civil dispute - resolved",
                "status": "Dismissed",
                "severity": "low"
            }
        ]
    else:
        criminal_status = "pass"
        criminal_records = []
    
    # Eviction history check
    if name_hash < 3:  # 3% have eviction history
        eviction_status = "fail"
        eviction_records = [
            {
                "date": "2019-11-10",
                "address": "Previous residence",
                "reason": "Lease violation",
                "status": "Resolved"
            }
        ]
    elif name_hash < 8:  # 5% review
        eviction_status = "review"
        eviction_records = [
            {
                "date": "2021-05-15",
                "address": "Previous residence",
                "reason": "Late payment - resolved",
                "status": "Resolved"
            }
        ]
    else:
        eviction_status = "pass"
        eviction_records = []
    
    # Employment verification
    employment_verified = employer_name is not None
    if employment_verified:
        employment_status = "verified" if name_hash > 10 else "pending"
        employment_details = {
            "employer": employer_name,
            "verification_date": datetime.now().isoformat(),
            "status": "Active" if name_hash > 5 else "Pending verification"
        }
    else:
        employment_status = "not_provided"
        employment_details = {
            "employer": "Not provided",
            "verification_date": None,
            "status": "Unable to verify"
        }
    
    # Identity verification (always pass if we have license info)
    identity_verified = license_number is not None or dob is not None
    identity_status = "verified" if identity_verified else "partial"
    identity_details = {
        "name_match": True,
        "dob_verified": dob is not None,
        "license_verified": license_number is not None,
        "ssn_verified": name_hash > 50,  # Mock SSN verification
        "status": "Identity confirmed" if identity_verified else "Partial verification"
    }
    
    # Credit check (use actual credit score if available)
    credit_status = "excellent" if credit_score and credit_score >= 750 else \
                    "good" if credit_score and credit_score >= 650 else \
                    "fair" if credit_score and credit_score >= 600 else \
                    "poor" if credit_score and credit_score < 600 else "not_provided"
    
    # Overall status
    if criminal_status == "fail" or eviction_status == "fail" or (credit_score and credit_score < 550):
        overall_status = "fail"
    elif criminal_status == "review" or eviction_status == "review" or credit_status in ["fair", "poor"]:
        overall_status = "review"
    else:
        overall_status = "pass"
    
    # Generate mock report ID
    report_id = f"BC-{random.randint(100000, 999999)}-{datetime.now().strftime('%Y%m%d')}"
    
    return {
        "report_id": report_id,
        "completed_at": datetime.now().isoformat(),
        "applicant_name": applicant_name,
        "overall_status": overall_status,
        "criminal_history": {
            "status": criminal_status,
            "records": criminal_records,
            "checked_at": datetime.now().isoformat(),
            "jurisdictions_checked": ["Statewide", "Federal"],
            "summary": "No serious criminal records found" if criminal_status == "pass" else \
                       "Minor records found - review recommended" if criminal_status == "review" else \
                       "Records found - requires review"
        },
        "eviction_history": {
            "status": eviction_status,
            "records": eviction_records,
            "checked_at": datetime.now().isoformat(),
            "databases_checked": ["National Tenant Registry", "County Records"],
            "summary": "No eviction history found" if eviction_status == "pass" else \
                       "History found - review recommended" if eviction_status == "review" else \
                       "Eviction history found"
        },
        "employment_verification": {
            "status": employment_status,
            "details": employment_details,
            "verified_at": datetime.now().isoformat() if employment_verified else None,
            "summary": "Employment verified" if employment_status == "verified" else \
                       "Employment verification pending" if employment_status == "pending" else \
                       "Employment information not provided"
        },
        "identity_verification": {
            "status": identity_status,
            "details": identity_details,
            "verified_at": datetime.now().isoformat(),
            "summary": "Identity verified" if identity_status == "verified" else \
                       "Partial identity verification"
        },
        "credit_check": {
            "status": credit_status,
            "credit_score": credit_score,
            "checked_at": datetime.now().isoformat(),
            "bureaus_checked": ["Equifax", "Experian", "TransUnion"],
            "summary": f"Credit score: {credit_score}" if credit_score else "Credit score not provided"
        }
    }


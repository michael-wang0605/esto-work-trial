"""
Intelligent Tenant Agent using Gemini AI
This agent processes tenant applications, fetches data from database, uses Gemini to rank applicants,
and makes intelligent decisions about which applicants to approve/schedule.
"""

import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend_modules.llm_service import call_gemini, TEXT_MODEL
from backend_modules.tenant_ranking_agent import find_best_applicants_for_property, get_applicant_summary

# Comprehensive agent system prompt
TENANT_AGENT_SYSTEM_PROMPT = """You are an intelligent tenant screening and selection agent for a property management company.

YOUR CAPABILITIES:
1. You receive tenant applications via email (Agentmail)
2. You process and extract data from applications (documents, credit scores, income)
3. You fetch application data from the database and use Gemini to rank and compare applicants
4. You make intelligent decisions about which applicants to approve/reject
5. You schedule property showings for approved applicants

YOUR WORKFLOW:
1. When an application arrives:
   - Extract applicant data (name, email, credit score, income)
   - Calculate screening score (green/yellow/red based on credit + income only)
   - Store application in Hyperspell as a searchable "memory"
   - Query Hyperspell to see how this applicant ranks against others

2. Decision Making (based on credit score and income only):
   - GREEN score (credit ≥680, income ≥3x rent): Auto-approve, send scheduling email
   - YELLOW score (credit ≥600, income ≥2.5x rent): Review manually or query Hyperspell for comparison
   - RED score (credit <600 or income <2.5x rent): Auto-reject or flag for review

3. Ranking Applicants:
   - Query Hyperspell to find top applicants: "Show me top 5 applicants with credit >700 and income ratio >3x"
   - Compare new applicant against existing applicants
   - Rank by: credit score (highest first), then income ratio (highest first)

4. Selection:
   - Use Hyperspell queries to find and rank the best applicants
   - Property managers contact approved applicants directly

IMPORTANT RULES:
- Always validate data before making decisions (credit score must be 300-850, income must be positive)
- Evaluation is based ONLY on credit score and income - no other factors considered
- If credit score or income is missing, request the missing information before processing
- Use Hyperspell queries to make data-driven decisions, not just rules
- Be professional and helpful in all email communications
- If Hyperspell query fails, fall back to basic rule-based screening
- Always log your decisions with reasoning

HYPERSPELL QUERY EXAMPLES:
- "Show me top 3 applicants for property_123 with credit scores above 700"
- "Which applicants have income ratio above 3.5x rent?"
- "Find the best applicant for property_123 ranked by credit score and income"
- "Rank all applicants by credit score and income ratio"

RESPONSE FORMAT:
Always provide clear reasoning for your decisions. Use this structure:
1. Data extracted from application
2. Screening score calculation
3. Hyperspell query results (if applicable)
4. Decision (approve/reject/review)
5. Action taken (email sent, calendar event created, etc.)

Remember: You are making real decisions that affect people's lives. Be fair, consistent, and data-driven."""

async def agent_process_application(
    user_id: str,
    application_data: Dict[str, Any],
    property_rent: float = 2000.0,
    existing_applications_count: int = 0
) -> Dict[str, Any]:
    """
    Intelligent agent processes a tenant application using Gemini + Hyperspell
    
    Args:
        user_id: Property manager user ID
        application_data: Application data (credit_score, monthly_income, status, etc.)
        property_rent: Monthly rent for the property
        existing_applications_count: Number of existing applications (for context)
    
    Returns:
        Dict with agent decision and reasoning
    """
    # Extract key data (handle both formats: application_data dict or direct values)
    credit_score = application_data.get("creditScore") or application_data.get("credit_score")
    monthly_income = application_data.get("monthlyIncome") or application_data.get("monthly_income") or 0
    income_ratio = (monthly_income / property_rent) if property_rent > 0 else 0
    screening_score = application_data.get("screeningScore") or application_data.get("screening_score", "unknown")
    status = application_data.get("status", "pending")
    applicant_name = application_data.get("applicantName") or application_data.get("applicant_name", "Applicant")
    
    # Validate data to prevent errors
    if credit_score and (not isinstance(credit_score, (int, float)) or credit_score < 300 or credit_score > 850):
        credit_score = None
    if monthly_income and (not isinstance(monthly_income, (int, float)) or monthly_income < 0):
        monthly_income = 0
    if not isinstance(income_ratio, (int, float)) or income_ratio < 0:
        income_ratio = 0
    
    # Build context for agent
    context = f"""
    NEW APPLICATION RECEIVED:
    Applicant: {applicant_name}
    Email: {application_data.get('applicantEmail', 'N/A')}
    Credit Score: {credit_score if credit_score else 'Not provided'}
    Monthly Income: ${monthly_income:,.2f}
    Property Rent: ${property_rent:,.2f}
    Income to Rent Ratio: {income_ratio:.2f}x
    Screening Score: {screening_score}
    Current Status: {status}
    
    Documents Provided:
    - Driver's License: {'Yes' if application_data.get('driversLicenseUrl') else 'No'}
    - Pay Stubs: {len(application_data.get('payStubUrls', []))} provided
    - Credit Report: {'Yes' if application_data.get('creditScoreUrl') else 'No'}
    
    Existing Applications in System: {existing_applications_count}
    """
    
    # Query Gemini to see how this applicant compares to others
    query_context = ""
    try:
        # Fetch other applications for comparison
        from backend_modules.tenant_ranking_agent import _fetch_applications_from_db
        other_apps = await _fetch_applications_from_db(user_id)
        
        if other_apps and len(other_apps) > 0:
            # Format other applicants for comparison
            comparison_text = "Other applicants in system:\n"
            for app in other_apps[:10]:  # Limit to 10 for prompt size
                comp_credit = app.get("creditScore", "N/A")
                comp_income = app.get("monthlyIncome", 0)
                comp_ratio = (comp_income / property_rent) if property_rent > 0 else 0
                comparison_text += f"- Credit: {comp_credit}, Income: ${comp_income:,.2f}, Ratio: {comp_ratio:.2f}x\n"
            
            comparison_prompt = f"""How does this applicant compare to others?
            
New Applicant:
- Credit score: {credit_score if credit_score else 'not provided'}
- Monthly income: ${monthly_income:,.2f}
- Income ratio: {income_ratio:.2f}x rent
- Screening score: {screening_score}

{comparison_text}

Is this applicant in the top 50% of applicants? Provide a brief assessment."""
            
            comparison_messages = [{"role": "user", "content": comparison_prompt}]
            comparison_result = await call_gemini(comparison_messages, TEXT_MODEL)
            query_context = comparison_result.get("content", "")
        else:
            query_context = "This is the first application in the system."
    except Exception as query_error:
        print(f"⚠️ Error comparing applicant: {query_error}")
        query_context = "Unable to compare with other applicants."
    
    # Build prompt for agent
    user_message = f"""
    {context}
    {query_context}
    
    DECISION REQUIRED:
    1. Should this applicant be approved, rejected, or flagged for review?
    2. What reasoning supports your decision?
    3. What action should be taken? (send approval email, rejection email, request more info)
    4. If approved, should we schedule a showing immediately?
    
    Provide a clear decision with reasoning.
    """
    
    messages = [
        {"role": "system", "content": TENANT_AGENT_SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]
    
    try:
        # Get agent decision from Gemini
        response = await call_gemini(messages, TEXT_MODEL)
        
        # Handle different response formats
        if isinstance(response, dict):
            agent_reasoning = response.get("content", "").strip()
        elif isinstance(response, str):
            agent_reasoning = response.strip()
        else:
            agent_reasoning = str(response).strip()
        
        # Validate response is not empty
        if not agent_reasoning:
            raise ValueError("Empty response from Gemini")
        
        # Parse decision from response (simple extraction)
        decision = "review"  # Default to review if unclear
        agent_reasoning_lower = agent_reasoning.lower()
        
        # More robust decision parsing
        if any(word in agent_reasoning_lower for word in ["approve", "approved", "excellent candidate", "strong applicant", "recommend approval"]):
            decision = "approve"
        elif any(word in agent_reasoning_lower for word in ["reject", "rejected", "decline", "not suitable", "does not meet"]):
            decision = "reject"
        # If unclear, keep as "review"
        
        return {
            "success": True,
            "decision": decision,
            "reasoning": agent_reasoning,
            "agent_used": "gemini",
            "comparison_performed": bool(query_context)
        }
    except Exception as e:
        print(f"❌ Agent processing error: {e}")
        import traceback
        traceback.print_exc()
        
        # Fallback to rule-based decision (with validation)
        decision = "review"  # Default
        if credit_score and isinstance(credit_score, (int, float)):
            if credit_score >= 680 and income_ratio >= 3.0:
                decision = "approve"
            elif credit_score >= 600 and income_ratio >= 2.5:
                decision = "review"
            else:
                decision = "reject"
        else:
            # No valid credit score, reject or review
            decision = "review" if income_ratio >= 2.5 else "reject"
        
        return {
            "success": True,
            "decision": decision,
            "reasoning": f"Fallback rule-based decision: credit={credit_score}, income_ratio={income_ratio:.2f}x, screening_score={screening_score}",
            "agent_used": "fallback",
            "comparison_performed": bool(query_context),
            "error": str(e)
        }


async def agent_rank_applicants_for_property(
    user_id: str,
    property_id: str,
    property_rent: float
) -> Dict[str, Any]:
    """
    Agent uses Gemini to intelligently rank applicants for a property
    """
    from backend_modules.tenant_ranking_agent import find_best_applicants_for_property, get_applicant_summary
    
    # Get ranked applicants using Gemini
    ranked_applicants = await find_best_applicants_for_property(
        user_id=user_id,
        property_id=property_id,
        property_monthly_rent=property_rent,
        limit=10,
        min_credit_score=600
    )
    
    if ranked_applicants:
        # Get summary from Gemini
        summary_result = await get_applicant_summary(
            user_id=user_id,
            question=f"Provide a summary ranking for applicants for property {property_id} with rent ${property_rent:,.2f}/month. Rank by screening score, credit score, and income ratio.",
            property_id=property_id
        )
        
        return {
            "success": True,
            "ranking_summary": summary_result.get("answer", "Ranking completed"),
            "top_applicants": [
                {
                    "rank": app.get("rank", idx + 1),
                    "application_id": app.get("application_id"),
                    "applicant_name": app.get("applicant_name"),
                    "credit_score": app.get("credit_score"),
                    "income_ratio": app.get("income_ratio"),
                    "screening_score": app.get("screening_score"),
                    "rank_reason": app.get("rank_reason", "")
                }
                for idx, app in enumerate(ranked_applicants)
            ],
            "total_found": len(ranked_applicants)
        }
    
    return {
        "success": False,
        "error": "No applicants found for ranking"
    }


async def agent_make_final_selection(
    user_id: str,
    property_id: str,
    property_rent: float
) -> Dict[str, Any]:
    """
    Agent makes final selection decision: which applicant should get the property?
    Returns only the SINGLE BEST applicant based on credit score and income.
    """
    # Use select_best_applicant_for_property which returns only one applicant
    from backend_modules.tenant_ranking_agent import select_best_applicant_for_property
    
    selection = await select_best_applicant_for_property(
        user_id=user_id,
        property_id=property_id,
        property_rent=property_rent
    )
    
    if not selection.get("selected"):
        return {"success": False, "error": selection.get("reason", "No qualified applicants found")}
    
    selected_applicant = selection.get("applicant")
    
    return {
        "success": True,
        "selected_applicant": selected_applicant,
        "reasoning": selection.get("reason", "Selected based on highest credit score and income ratio"),
        "ranking_summary": f"Best applicant selected: Credit score {selected_applicant.get('credit_score', 'N/A')}, Income ratio {selected_applicant.get('income_ratio', 0):.2f}x rent"
    }


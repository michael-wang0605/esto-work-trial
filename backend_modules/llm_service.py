"""
LLM service for handling AI interactions
"""

import os
import httpx
import json
from typing import List, Dict, Any

# Get config from environment (matching minimal_backend.py)
API_KEY = os.getenv("LLM_API_KEY", "")
TEXT_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")
VISION_MODEL = os.getenv("LLM_VISION_MODEL", "gemini-2.0-flash")
GEMINI_URL = os.getenv("LLM_URL", "https://generativelanguage.googleapis.com/v1beta/models")

async def call_gemini(messages: List[Dict[str, Any]], model: str, functions: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Call Gemini API with optional function calling"""
    # Convert OpenAI format to Gemini format
    contents = []
    for msg in messages:
        if msg["role"] == "system":
            # Gemini doesn't have system messages, prepend to user message
            continue
        elif msg["role"] == "user":
            if isinstance(msg["content"], list):
                # Handle multimodal content
                parts = []
                for part in msg["content"]:
                    if part["type"] == "text":
                        parts.append({"text": part["text"]})
                    elif part["type"] == "image_url":
                        parts.append({
                            "inline_data": {
                                "mime_type": "image/jpeg",  # Default, could be improved
                                "data": part["image_url"]["url"].split(",")[1] if "," in part["image_url"]["url"] else ""
                            }
                        })
                contents.append({"role": "user", "parts": parts})
            else:
                contents.append({"role": "user", "parts": [{"text": msg["content"]}]})
        elif msg["role"] == "assistant":
            contents.append({"role": "model", "parts": [{"text": msg["content"]}]})
    
    # Add system message to the first user message if it exists
    system_msg = next((msg for msg in messages if msg["role"] == "system"), None)
    if system_msg and contents and contents[0]["role"] == "user":
        if contents[0]["parts"][0]["text"]:
            contents[0]["parts"][0]["text"] = system_msg["content"] + "\n\n" + contents[0]["parts"][0]["text"]
        else:
            contents[0]["parts"][0]["text"] = system_msg["content"]
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1024,
        }
    }
    
    # Add function calling if functions are provided
    if functions:
        tools = []
        for func in functions:
            tools.append({
                "function_declarations": [{
                    "name": func["name"],
                    "description": func["description"],
                    "parameters": func["parameters"]
                }]
            })
        payload["tools"] = tools
    
    url = f"{GEMINI_URL}/{model}:generateContent"
    headers = {
        "Content-Type": "application/json",
    }
    params = {"key": API_KEY}
    
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, headers=headers, json=payload, params=params)
        try:
            r.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise Exception(f"Gemini error: {r.text}") from e
        data = r.json()
        
        # Convert Gemini response to OpenAI format
        if "candidates" in data and data["candidates"]:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                text_content = ""
                for part in candidate["content"]["parts"]:
                    if "text" in part:
                        text_content += part["text"]
                
                # Handle function calls
                if "functionCalls" in candidate:
                    return {
                        "content": text_content,
                        "tool_calls": [{
                            "function": {
                                "name": call["name"],
                                "arguments": json.dumps(call["args"])
                            }
                        } for call in candidate["functionCalls"]]
                    }
                
                return {"content": text_content}
        
        return {"content": "No response generated"}

# System prompts
TENANT_SMS_SYSTEM = (
    "You are Esto, a helpful assistant for tenants.\n"
    "You help tenants with maintenance issues, rent questions, and general property inquiries.\n"
    "\n"
    "MAINTENANCE TICKET CREATION:\n"
    "- Use the create_maintenance_ticket function when tenants report issues that require professional repair\n"
    "- Create tickets for: plumbing problems, electrical issues, heating/cooling problems, appliance failures, structural issues, safety concerns\n"
    "- DO NOT create tickets for: simple questions, general inquiries, non-urgent requests, or issues that can be resolved with basic troubleshooting\n"
    "- Always provide helpful troubleshooting steps first, then create a ticket if the issue requires professional attention\n"
    "- Check existing tickets to avoid duplicates - reference existing tickets instead of creating new ones\n"
    "\n"
    "RESPONSE GUIDELINES:\n"
    "- Be friendly, empathetic, and solution-oriented\n"
    "- Provide helpful troubleshooting steps for common issues\n"
    "- Keep responses concise and easy to understand via SMS\n"
    "- Always reference previous conversations when relevant\n"
    "- If you create a ticket, mention it in your response\n"
)

PM_CHAT_SYSTEM = (
    "You are Esto, an AI assistant for property managers.\n"
    "You help property managers understand tenant communications, maintenance issues, and property management tasks.\n"
    "When discussing tenant information, include all available contact details.\n"
    "For maintenance issues, reference any existing tickets and provide status updates.\n"
    "Keep responses detailed but concise, formatted for easy reading.\n"
)

LEASE_PROCESSING_SYSTEM = (
    "You are a lease document analysis AI. Your job is to analyze lease/rental agreements and extract key information.\n"
    "Extract the following information from the lease document:\n"
    "1. Lease start and end dates\n"
    "2. Monthly rent amount\n"
    "3. Security deposit amount\n"
    "4. Key terms and conditions (pet policy, parking, utilities, etc.)\n"
    "5. Important clauses (late fees, maintenance responsibilities, etc.)\n"
    "6. Contact information for property management\n"
    "\n"
    "Provide a concise summary and extract key terms that would be useful for answering tenant questions.\n"
    "Format dates as YYYY-MM-DD and amounts as numbers only.\n"
)

async def process_lease_document(text: str) -> Dict[str, Any]:
    """Process a lease document and extract key information"""
    messages = [
        {"role": "system", "content": LEASE_PROCESSING_SYSTEM},
        {"role": "user", "content": f"Please analyze this lease document and extract the key information:\n\n{text}"}
    ]
    
    functions = [
        {
            "name": "extract_lease_info",
            "description": "Extract key information from a lease document",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {
                        "type": "string",
                        "description": "A concise summary of the lease agreement"
                    },
                    "keyTerms": {
                        "type": "string",
                        "description": "Key terms and conditions, separated by commas"
                    },
                    "startDate": {
                        "type": "string",
                        "description": "Lease start date in YYYY-MM-DD format"
                    },
                    "endDate": {
                        "type": "string", 
                        "description": "Lease end date in YYYY-MM-DD format"
                    },
                    "monthlyRent": {
                        "type": "number",
                        "description": "Monthly rent amount"
                    },
                    "securityDeposit": {
                        "type": "number",
                        "description": "Security deposit amount"
                    }
                },
                "required": ["summary", "keyTerms"]
            }
        }
    ]
    
    try:
        response = await call_gemini(messages, TEXT_MODEL, functions)
        
        if response.get("tool_calls"):
            # Extract the function call result
            tool_call = response["tool_calls"][0]
            if tool_call["function"]["name"] == "extract_lease_info":
                import json
                return json.loads(tool_call["function"]["arguments"])
        
        # Fallback if function calling doesn't work
        return {
            "summary": response.get("content", "Lease document processed successfully."),
            "keyTerms": "Lease terms extracted",
            "startDate": None,
            "endDate": None,
            "monthlyRent": None,
            "securityDeposit": None
        }
        
    except Exception as e:
        print(f"Error processing lease document: {e}")
        return {
            "summary": "Error processing lease document. Please review manually.",
            "keyTerms": "Processing error",
            "startDate": None,
            "endDate": None,
            "monthlyRent": None,
            "securityDeposit": None
        }

# Tenant Application Document Processing
TENANT_DOCUMENT_SYSTEM = (
    "You are a document analysis AI specialized in processing tenant application documents.\n"
    "Your job is to extract accurate information from driver's licenses, pay stubs, and credit score documents.\n"
    "\n"
    "For DRIVER'S LICENSE:\n"
    "- Extract: Full name, date of birth, expiration date, license number, state\n"
    "- Validate expiration date (flag if expired or expiring within 30 days)\n"
    "- Format dates as YYYY-MM-DD\n"
    "\n"
    "For PAY STUBS:\n"
    "- Extract: Employer name, gross income amount, pay period (weekly/bi-weekly/monthly), pay date\n"
    "- Calculate monthly and annual income based on pay frequency\n"
    "- If multiple pay stubs, use the most recent or average\n"
    "\n"
    "For CREDIT SCORE DOCUMENTS:\n"
    "- Extract: Credit score number (must be 300-850), date pulled, credit bureau name\n"
    "- Validate score is numeric and within valid range\n"
    "\n"
    "Return ONLY valid JSON. Use null for missing values.\n"
)

async def process_tenant_documents(
    drivers_license_url: str = None,
    pay_stub_urls: List[str] = None,
    credit_score_url: str = None
) -> Dict[str, Any]:
    """
    Process tenant application documents using Gemini Vision model
    Returns extracted data from driver's license, pay stubs, and credit score documents
    """
    extraction_result = {
        "licenseName": None,
        "licenseDOB": None,
        "licenseExpiration": None,
        "licenseNumber": None,
        "licenseValid": True,
        "employerName": None,
        "monthlyIncome": None,
        "annualIncome": None,
        "payFrequency": None,
        "creditScore": None,
        "creditScoreDate": None,
        "extractionErrors": []
    }
    
    pay_stub_urls = pay_stub_urls or []
    
    # Process driver's license
    if drivers_license_url:
        try:
            result = await _extract_drivers_license(drivers_license_url)
            extraction_result.update(result)
        except Exception as e:
            extraction_result["extractionErrors"].append(f"Driver's license extraction failed: {str(e)}")
    
    # Process pay stubs
    if pay_stub_urls:
        try:
            result = await _extract_pay_stubs(pay_stub_urls)
            extraction_result.update(result)
        except Exception as e:
            extraction_result["extractionErrors"].append(f"Pay stub extraction failed: {str(e)}")
    
    # Process credit score
    if credit_score_url:
        try:
            result = await _extract_credit_score(credit_score_url)
            extraction_result.update(result)
        except Exception as e:
            extraction_result["extractionErrors"].append(f"Credit score extraction failed: {str(e)}")
    
    return extraction_result

async def _extract_drivers_license(image_url: str) -> Dict[str, Any]:
    """Extract information from driver's license image"""
    prompt = """Extract the following information from this driver's license image:
1. Full name
2. Date of birth (YYYY-MM-DD format)
3. Expiration date (YYYY-MM-DD format)
4. License number
5. State abbreviation

Return as JSON with keys: licenseName, licenseDOB, licenseExpiration, licenseNumber, state.
Validate expiration date - set licenseValid to false if expired or expiring within 30 days."""
    
    messages = [
        {"role": "system", "content": TENANT_DOCUMENT_SYSTEM},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        }
    ]
    
    functions = [{
        "name": "extract_drivers_license",
        "description": "Extract driver's license information",
        "parameters": {
            "type": "object",
            "properties": {
                "licenseName": {"type": "string"},
                "licenseDOB": {"type": "string", "description": "Date of birth in YYYY-MM-DD format"},
                "licenseExpiration": {"type": "string", "description": "Expiration date in YYYY-MM-DD format"},
                "licenseNumber": {"type": "string"},
                "state": {"type": "string"},
                "licenseValid": {"type": "boolean"}
            },
            "required": ["licenseName", "licenseDOB", "licenseExpiration"]
        }
    }]
    
    response = await call_gemini(messages, VISION_MODEL, functions)
    
    if response.get("tool_calls"):
        tool_call = response["tool_calls"][0]
        if tool_call["function"]["name"] == "extract_drivers_license":
            import json
            result = json.loads(tool_call["function"]["arguments"])
            # Parse dates
            from datetime import datetime
            if result.get("licenseDOB"):
                result["licenseDOB"] = datetime.fromisoformat(result["licenseDOB"].replace("Z", "+00:00"))
            if result.get("licenseExpiration"):
                result["licenseExpiration"] = datetime.fromisoformat(result["licenseExpiration"].replace("Z", "+00:00"))
            return result
    
    return {}

async def _extract_pay_stubs(image_urls: List[str]) -> Dict[str, Any]:
    """Extract information from pay stub images"""
    if not image_urls:
        return {}
    
    prompt = f"""Analyze {len(image_urls)} pay stub image(s) and extract:
1. Employer name
2. Gross income amount
3. Pay period (weekly/bi-weekly/monthly)
4. Pay date (most recent if multiple)

Calculate monthly and annual income based on pay frequency.
If multiple pay stubs, use the most recent or average."""
    
    # Build multimodal content with all pay stub images
    content = [{"type": "text", "text": prompt}]
    for url in image_urls:
        content.append({"type": "image_url", "image_url": {"url": url}})
    
    messages = [
        {"role": "system", "content": TENANT_DOCUMENT_SYSTEM},
        {"role": "user", "content": content}
    ]
    
    functions = [{
        "name": "extract_pay_stub",
        "description": "Extract pay stub information",
        "parameters": {
            "type": "object",
            "properties": {
                "employerName": {"type": "string"},
                "grossIncome": {"type": "number", "description": "Gross income per pay period"},
                "payFrequency": {"type": "string", "enum": ["weekly", "bi-weekly", "monthly"]},
                "payDate": {"type": "string", "description": "Pay date in YYYY-MM-DD format"},
                "monthlyIncome": {"type": "number", "description": "Calculated monthly income"},
                "annualIncome": {"type": "number", "description": "Calculated annual income"}
            },
            "required": ["employerName", "grossIncome", "payFrequency"]
        }
    }]
    
    response = await call_gemini(messages, VISION_MODEL, functions)
    
    if response.get("tool_calls"):
        tool_call = response["tool_calls"][0]
        if tool_call["function"]["name"] == "extract_pay_stub":
            import json
            return json.loads(tool_call["function"]["arguments"])
    
    return {}

async def _extract_credit_score(image_url: str) -> Dict[str, Any]:
    """Extract credit score from document image"""
    prompt = """Extract credit score information from this document:
1. Credit score number (must be 300-850)
2. Date when score was pulled (YYYY-MM-DD format)
3. Credit bureau name (Experian, Equifax, TransUnion, or other)

Validate that the score is numeric and within valid range (300-850)."""
    
    messages = [
        {"role": "system", "content": TENANT_DOCUMENT_SYSTEM},
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        }
    ]
    
    functions = [{
        "name": "extract_credit_score",
        "description": "Extract credit score information",
        "parameters": {
            "type": "object",
            "properties": {
                "creditScore": {"type": "integer", "description": "Credit score (300-850)"},
                "creditScoreDate": {"type": "string", "description": "Date pulled in YYYY-MM-DD format"},
                "creditBureau": {"type": "string", "description": "Credit bureau name"}
            },
            "required": ["creditScore"]
        }
    }]
    
    response = await call_gemini(messages, VISION_MODEL, functions)
    
    if response.get("tool_calls"):
        tool_call = response["tool_calls"][0]
        if tool_call["function"]["name"] == "extract_credit_score":
            import json
            result = json.loads(tool_call["function"]["arguments"])
            # Validate and parse date
            score = result.get("creditScore", 0)
            if score < 300 or score > 850:
                result["creditScore"] = None
            if result.get("creditScoreDate"):
                from datetime import datetime
                result["creditScoreDate"] = datetime.fromisoformat(result["creditScoreDate"].replace("Z", "+00:00"))
            return result
    
    return {}
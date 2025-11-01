# Agentmail + Hyperspell Workflow: Intelligent Tenant Selection

This document explains how to use **Agentmail** and **Hyperspell** together to create an AI agent that can automatically rank and select the best tenant applicants.

## The Workflow

```
1. Agentmail → Receives tenant application emails
2. Agent processes → Extracts data, stores in Hyperspell as memories
3. Hyperspell indexes → All application data becomes searchable/queryable
4. AI Agent queries Hyperspell → Uses natural language to rank/select applicants
5. Agent takes action → Schedules showing, sends emails, etc.
```

---

## Step 1: Index Applications to Hyperspell

When an application comes in via Agentmail, store it in Hyperspell:

```python
# In backend_modules/inbox_monitor.py

async def process_incoming_email_data(...):
    # ... existing processing code ...
    
    # After saving application to database, index it in Hyperspell
    hyperspell_client = HyperspellClient()
    
    # Create comprehensive text representation for Hyperspell
    application_text = f"""
    Tenant Application: {contact_info['name']}
    Email: {contact_info['email']}
    Phone: {contact_info.get('phone', 'N/A')}
    
    Credit Score: {extraction_result.get('credit_score', 'Not provided')}
    Monthly Income: ${extraction_result.get('monthly_income', 0):,.2f}
    Annual Income: ${extraction_result.get('annual_income', 0):,.2f}
    Income to Rent Ratio: {(extraction_result.get('monthly_income', 0) / monthly_rent):.2f}x
    Employer: {extraction_result.get('employer', 'Not provided')}
    
    Screening Score: {score} ({notes})
    Status: {status}
    
    Background Check: {background_check_result}
    
    Documents Provided:
    - Driver's License: {'Yes' if drivers_license_url else 'No'}
    - Pay Stubs: {len(pay_stub_urls)} provided
    - Credit Report: {'Yes' if credit_score_url else 'No'}
    
    Property: {property_id if property_id else 'Not specified'}
    Received: {datetime.now().isoformat()}
    """
    
    # Store in Hyperspell with metadata
    memory_result = await hyperspell_client.add_memory(
        user_id=user_id,
        text=application_text,
        collection="tenant_applications",
        metadata={
            "application_id": application_id,
            "property_id": property_id,
            "applicant_email": contact_info['email'],
            "status": status,
            "screening_score": score,
            "credit_score": extraction_result.get('credit_score'),
            "monthly_income": extraction_result.get('monthly_income'),
            "income_ratio": extraction_result.get('monthly_income', 0) / monthly_rent,
            "received_at": datetime.now().isoformat()
        }
    )
    
    print(f"✅ Indexed application {application_id} in Hyperspell")
```

---

## Step 2: AI Agent Queries Hyperspell to Rank Applicants

Your AI agent can now query Hyperspell to find the best applicants:

```python
# In backend_modules/llm_service.py or a new agent module

from backend_modules.hyperspell_service import HyperspellClient

async def find_best_applicants_for_property(
    user_id: str,
    property_id: str,
    property_monthly_rent: float,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    AI Agent queries Hyperspell to find and rank the best applicants
    """
    hyperspell_client = HyperspellClient()
    
    # Query Hyperspell with natural language
    query = f"""
    Show me the top {limit} tenant applicants who:
    - Have credit scores above 680
    - Have monthly income at least 3x the rent amount of ${property_monthly_rent}
    - Have green screening scores
    - Have valid driver's licenses
    - Have complete documentation (license, pay stubs, credit report)
    - Have no negative background check results
    
    Rank them by: highest credit score first, then highest income ratio
    """
    
    result = await hyperspell_client.query(
        user_id=user_id,
        query=query,
        collections=["tenant_applications"],
        answer=False,  # Get documents, not summary
        limit=limit
    )
    
    if result["success"]:
        # Extract application IDs from metadata
        applications = []
        for doc in result["documents"]:
            metadata = doc.get("metadata", {})
            applications.append({
                "application_id": metadata.get("application_id"),
                "applicant_email": metadata.get("applicant_email"),
                "credit_score": metadata.get("credit_score"),
                "monthly_income": metadata.get("monthly_income"),
                "income_ratio": metadata.get("income_ratio"),
                "screening_score": metadata.get("screening_score"),
                "rank": len(applications) + 1,
                "text": doc.get("text", "")  # Full application details
            })
        
        return applications
    
    return []
```

---

## Step 3: Agent Uses Hyperspell to Make Decisions

Your agent can query Hyperspell to answer questions and make decisions:

```python
async def agent_decide_which_applicants_to_contact(
    user_id: str,
    property_id: str
) -> Dict[str, Any]:
    """
    AI Agent uses Hyperspell to decide which applicants to contact
    """
    hyperspell_client = HyperspellClient()
    
    # Ask Hyperspell to rank applicants
    query_result = await hyperspell_client.query(
        user_id=user_id,
        query=f"""
        For property {property_id}, show me all applicants ranked by:
        1. Screening score (green > yellow > red)
        2. Credit score (highest first)
        3. Income to rent ratio (highest first)
        4. Complete documentation (all docs provided)
        5. No background check issues
        
        Return the top 3 applicants.
        """,
        collections=["tenant_applications"],
        answer=True,  # Get AI-generated summary
        limit=10
    )
    
    if query_result["success"]:
        # Agent can use the answer to make decisions
        answer = query_result["answer"]
        documents = query_result["documents"]
        
        # Extract top applicants
        top_applicants = []
        for doc in documents[:3]:
            metadata = doc.get("metadata", {})
            top_applicants.append({
                "application_id": metadata.get("application_id"),
                "applicant_email": metadata.get("applicant_email"),
                "reason": doc.get("text", "")[:200]  # Why they were selected
            })
        
        return {
            "decision": answer,
            "top_applicants": top_applicants,
            "source_documents": documents
        }
    
    return {"decision": "Unable to rank applicants", "top_applicants": []}
```

---

## Step 4: Complete Agent Workflow

Here's a complete agent that uses both Agentmail and Hyperspell:

```python
async def intelligent_tenant_screening_agent(user_id: str):
    """
    Complete AI agent workflow:
    1. Check Agentmail for new applications
    2. Process and index in Hyperspell
    3. Query Hyperspell to rank applicants
    4. Take actions (schedule showings, send emails)
    """
    from backend_modules.inbox_monitor import monitor_inbox
    from backend_modules.agentmail_service import AgentmailClient
    from backend_modules.hyperspell_service import HyperspellClient
    
    # Step 1: Monitor Agentmail inbox
    await monitor_inbox()  # This processes emails and indexes to Hyperspell
    
    # Step 2: Query Hyperspell to find best applicants
    hyperspell_client = HyperspellClient()
    
    # Find approved applicants that need scheduling
    result = await hyperspell_client.query(
        user_id=user_id,
        query="""
        Show me all approved (green screening score) applicants with:
        - Credit score above 680
        - Income ratio above 3x rent
        - Complete documents
        - Status is 'approved' or 'awaiting_tenant'
        - No showing scheduled yet
        
        Rank by credit score descending
        """,
        collections=["tenant_applications"],
        answer=False,
        limit=10
    )
    
    if result["success"]:
        agentmail_client = AgentmailClient()
        
        # Step 3: For each top applicant, schedule showing
        for doc in result["documents"]:
            metadata = doc.get("metadata", {})
            application_id = metadata.get("application_id")
            applicant_email = metadata.get("applicant_email")
            
            # Get calendar availability
            availability = await hyperspell_client.get_availability(
                user_id=user_id,
                days=14
            )
            
            if availability:
                # Send scheduling email
                from backend_modules.agentmail_service import get_scheduling_email_template
                
                slots = [{"date": s.get("date"), "time": s.get("time")} for s in availability[:10]]
                subject, body = get_scheduling_email_template(
                    metadata.get("applicant_name", "Applicant"),
                    slots
                )
                
                await agentmail_client.send_email(
                    to=applicant_email,
                    subject=subject,
                    body=body
                )
                
                print(f"✅ Agent scheduled showing for application {application_id}")
    
    print("✅ Agent workflow complete")
```

---

## Advanced: Cross-Property Ranking

Your agent can query across multiple properties:

```python
async def agent_find_best_applicants_overall(user_id: str) -> Dict[str, Any]:
    """
    Agent queries Hyperspell to find the best applicants across ALL properties
    """
    hyperspell_client = HyperspellClient()
    
    result = await hyperspell_client.query(
        user_id=user_id,
        query="""
        Show me the top 10 tenant applicants overall, ranked by:
        1. Green screening score
        2. Credit score above 700
        3. Income ratio above 3.5x their property's rent
        4. Complete documentation
        5. No background check issues
        
        Group by property and show the best applicant for each property.
        """,
        collections=["tenant_applications"],
        answer=True,  # Get AI summary
        limit=50
    )
    
    return result
```

---

## Benefits of This Approach

### 1. **Natural Language Queries**
Your agent can ask questions like:
- "Who are the top 3 applicants for Main Street property?"
- "Show me applicants with credit above 720 who applied this week"
- "Which applicants need follow-up?"

### 2. **Semantic Search**
Hyperspell finds relevant applications even if you don't know exact keywords:
- "Find applicants who are financially strong" → finds high income + credit
- "Show me risky applicants" → finds red scores or missing docs

### 3. **Ranking & Sorting**
Hyperspell can rank by multiple factors:
- Credit score + income ratio + document completeness
- Time-based (most recent applications)
- Property-specific criteria

### 4. **Cross-Reference Data**
Query across:
- Applications
- Email threads
- Lease documents
- Property information

### 5. **AI-Generated Summaries**
Use `answer=True` to get intelligent summaries:
- "The top 3 applicants are John Smith (750 credit, $6k income), Jane Doe (720 credit, $5.5k income)..."
- Instead of just raw documents

---

## Example Agent Decision Making

```python
async def agent_workflow_example():
    """
    Complete example: Agent receives application → queries Hyperspell → makes decision
    """
    user_id = "property_manager_123"
    
    # 1. New application comes in via Agentmail
    # (handled by monitor_inbox() - already indexes to Hyperspell)
    
    # 2. Agent queries: "Should I approve this applicant?"
    hyperspell_client = HyperspellClient()
    
    result = await hyperspell_client.query(
        user_id=user_id,
        query="""
        Based on all our tenant applications, would an applicant with:
        - Credit score 680
        - Monthly income $5000
        - Rent $1500/month
        - Green screening score
        - Complete documents
        
        be in the top 20% of applicants we've received?
        """,
        collections=["tenant_applications"],
        answer=True
    )
    
    if result["success"]:
        answer = result["answer"]
        
        # Agent makes decision based on Hyperspell's answer
        if "top 20%" in answer.lower() or "above average" in answer.lower():
            # Approve and schedule showing
            print("✅ Agent decision: Approve (top 20% applicant)")
        else:
            # Review manually
            print("⚠️ Agent decision: Needs manual review")
    
    return result
```

---

## Integration with Your Current Code

Add to `backend_modules/inbox_monitor.py`:

```python
# After processing application (around line 260)

# Index in Hyperspell for future querying
hyperspell_client = HyperspellClient()
await index_application_in_hyperspell(
    hyperspell_client, 
    user_id, 
    application_data, 
    application_id
)
```

This way, every application that comes in via Agentmail automatically becomes queryable in Hyperspell, and your agent can rank/select applicants intelligently!


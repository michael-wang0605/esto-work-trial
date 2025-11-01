# How to Query the Best Applicant with Hyperspell

This guide shows you how to use Hyperspell to query and rank the best tenant applicants.

## Overview

Hyperspell uses natural language queries to search through indexed applicant data. You can ask questions like:
- "Show me the best applicants for property X"
- "Who are the top 3 applicants with credit above 700?"
- "Find applicants with green scores and income above 3x rent"

---

## Quick Start: Find Best Applicant

### Method 1: Using the Built-in Function

```python
from backend_modules.tenant_ranking_agent import find_best_applicants_for_property

# Find top 5 applicants for a property
applicants = await find_best_applicants_for_property(
    user_id="your_user_id",
    property_id="property_123",
    property_monthly_rent=2000.0,
    limit=5,
    min_credit_score=680
)

# Best applicant is first in the list
if applicants:
    best_applicant = applicants[0]
    print(f"Best applicant: {best_applicant['applicant_name']}")
    print(f"Credit: {best_applicant['credit_score']}")
    print(f"Income Ratio: {best_applicant['income_ratio']:.2f}x")
```

### Method 2: Direct Hyperspell Query

```python
from backend_modules.hyperspell_service import HyperspellClient

client = HyperspellClient()

result = await client.query(
    user_id="your_user_id",
    query="""
    Show me the best tenant applicant who:
    - Has credit score above 700
    - Has income at least 3x rent of $2000/month
    - Has green screening score
    - Has complete documents
    - Has valid driver's license
    
    Rank by highest credit score first, then highest income
    """,
    collections=["tenant_applications"],
    answer=False,  # Get documents
    limit=1  # Just the best one
)

if result["success"] and result["documents"]:
    best_doc = result["documents"][0]
    metadata = best_doc.get("metadata", {})
    print(f"Best applicant ID: {metadata.get('application_id')}")
    print(f"Details: {best_doc.get('text', '')}")
```

---

## Query Patterns for Best Applicant

### Pattern 1: Simple Best Applicant Query

```python
query = "Show me the best tenant applicant ranked by credit score and income"
```

### Pattern 2: Best Applicant for Specific Property

```python
query = """
Show me the best applicant for property abc123 with:
- Credit score above 680
- Income at least 3x the property rent
- Green screening score
Rank by credit score descending
"""
```

### Pattern 3: Best Applicant with Multiple Criteria

```python
query = """
Find the best tenant applicant who:
- Has credit score above 720
- Has monthly income above $6000
- Has green screening score
- Has complete documentation (license, pay stubs, credit report)
- Has no background check issues
- Applied in the last 30 days

Rank by: credit score first, then income ratio, then application recency
"""
```

### Pattern 4: Best Applicant with AI Summary

```python
# Get AI-generated answer about the best applicant
result = await client.query(
    user_id=user_id,
    query="Who is the best applicant for property X and why?",
    collections=["tenant_applications"],
    answer=True,  # Get AI summary
    limit=10
)

print(result["answer"])  # AI-generated explanation
```

---

## Advanced: Custom Ranking Criteria

### Example: Rank by Income Ratio Priority

```python
from backend_modules.tenant_ranking_agent import rank_applicants_by_criteria

applicants = await rank_applicants_by_criteria(
    user_id="your_user_id",
    criteria={
        "property_id": "property_123",
        "min_credit_score": 650,
        "min_income_ratio": 3.0,
        "screening_score": "green",
        "status": "pending"  # or "approved"
    },
    limit=10
)

# Applicants are pre-ranked
for app in applicants:
    print(f"Rank {app['rank']}: {app.get('applicant_email')}")
```

### Example: Select Single Best Applicant

```python
from backend_modules.tenant_ranking_agent import select_best_applicant_for_property

selection = await select_best_applicant_for_property(
    user_id="your_user_id",
    property_id="property_123",
    property_rent=2000.0
)

if selection["selected"]:
    print(f"Selected: {selection['applicant']['applicant_name']}")
    print(f"Reason: {selection['reason']}")
else:
    print("No qualified applicant found")
```

---

## Query Examples for Different Scenarios

### Scenario 1: Find Best Overall Applicant (Any Property)

```python
query = """
Show me the single best tenant applicant overall who has:
- Highest credit score
- Highest income to rent ratio
- Green screening score
- Complete documentation

Return only the top 1 applicant
"""

result = await client.query(
    user_id=user_id,
    query=query,
    collections=["tenant_applications"],
    limit=1
)
```

### Scenario 2: Find Best Applicant with Specific Rent Requirement

```python
property_rent = 2500.0  # Monthly rent

query = f"""
Find the best tenant applicant who:
- Can afford rent of ${property_rent:,.2f}/month (income at least 3x rent = ${property_rent * 3:,.2f})
- Has credit score above 680
- Has green or yellow screening score
- Has valid documents

Rank by: income ratio highest first, then credit score
"""

result = await client.query(
    user_id=user_id,
    query=query,
    collections=["tenant_applications"],
    limit=3  # Top 3 candidates
)
```

### Scenario 3: Find Best Applicant by Property Type

```python
query = """
Show me the best applicant for luxury properties (rent above $3000/month) with:
- Credit score above 720
- Annual income above $100,000
- Green screening score
- Excellent references

Rank by credit score and income ratio
"""
```

### Scenario 4: Find Best Applicant This Week

```python
query = """
Show me the best tenant applicant who applied in the last 7 days with:
- Credit score above 700
- Income ratio above 3.5x rent
- Green screening score
- Complete documentation

Rank by application recency first, then credit score
"""
```

---

## Using the API Endpoint

If you have the API endpoint set up, you can query from anywhere:

### Python Backend

```python
import httpx

async def query_best_applicant(user_id: str, property_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://your-backend.com/api/hyperspell/query",
            json={
                "user_id": user_id,
                "query": f"Show me the best applicant for property {property_id} ranked by credit score and income",
                "collections": ["tenant_applications"],
                "answer": False,
                "limit": 1
            }
        )
        return response.json()
```

### TypeScript Frontend

```typescript
async function getBestApplicant(userId: string, propertyId: string) {
  const response = await fetch('/api/hyperspell/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      query: `Show me the best applicant for property ${propertyId} ranked by credit score and income ratio`,
      collections: ['tenant_applications'],
      answer: false,
      limit: 1
    })
  });
  
  const result = await response.json();
  if (result.success && result.documents.length > 0) {
    return result.documents[0];
  }
  return null;
}
```

---

## Ranking Factors You Can Use

When querying for the "best" applicant, Hyperspell considers these factors based on your query:

1. **Credit Score** - Higher is better
2. **Income to Rent Ratio** - 3x+ is ideal, higher is better
3. **Screening Score** - Green > Yellow > Red
4. **Document Completeness** - All docs provided is better
5. **Background Check** - No issues is better
6. **Application Recency** - More recent can be prioritized
7. **License Validity** - Valid/not expiring soon is better
8. **Employer Stability** - Can be inferred from metadata

---

## Tips for Best Results

1. **Be Specific**: Include property ID, rent amount, and criteria in your query
2. **Use Multiple Factors**: Rank by 2-3 factors (e.g., credit + income ratio)
3. **Set Limits**: Use `limit=1` if you only want the best, `limit=5` for top candidates
4. **Use Metadata**: Hyperspell stores application IDs in metadata for easy retrieval
5. **Answer Mode**: Use `answer=True` for AI-generated summaries explaining why an applicant is best

---

## Complete Example: Full Workflow

```python
from backend_modules.hyperspell_service import HyperspellClient
from backend_modules.tenant_ranking_agent import select_best_applicant_for_property

async def find_and_contact_best_applicant(user_id: str, property_id: str, rent: float):
    """
    Complete workflow: Find best applicant → Get details → Take action
    """
    # Step 1: Find best applicant
    selection = await select_best_applicant_for_property(
        user_id=user_id,
        property_id=property_id,
        property_rent=rent
    )
    
    if not selection["selected"]:
        print("No qualified applicant found")
        return None
    
    best_applicant = selection["applicant"]
    application_id = best_applicant["application_id"]
    
    # Step 2: Get full details with AI summary
    client = HyperspellClient()
    summary = await client.query(
        user_id=user_id,
        query=f"Why is applicant {application_id} the best choice?",
        collections=["tenant_applications"],
        answer=True,
        limit=1
    )
    
    print(f"Best Applicant: {best_applicant['applicant_name']}")
    print(f"Email: {best_applicant['applicant_email']}")
    print(f"Credit: {best_applicant['credit_score']}")
    print(f"Income Ratio: {best_applicant['income_ratio']:.2f}x")
    print(f"\nAI Summary: {summary.get('answer', 'N/A')}")
    
    # Step 3: Take action (schedule showing, send email, etc.)
    # ... your action code here ...
    
    return best_applicant
```

---

## Troubleshooting

**No results returned?**
- Check that applications are indexed in Hyperspell first
- Verify `user_id` matches the one used when indexing
- Make sure criteria aren't too strict (try lowering credit score threshold)

**Wrong applicant selected?**
- Refine your query to be more specific about ranking factors
- Use `answer=True` to see AI reasoning
- Check metadata to verify all criteria fields are indexed

**Slow queries?**
- Reduce `limit` parameter
- Use specific property_id to narrow search
- Index applications efficiently (see `HYPERSPELL_QUERY_EXAMPLES.md`)

---

## Related Files

- `backend_modules/hyperspell_service.py` - Hyperspell client implementation
- `backend_modules/tenant_ranking_agent.py` - Ranking functions
- `HYPERSPELL_QUERY_EXAMPLES.md` - General query examples
- `AGENTMAIL_HYPERSPELL_WORKFLOW.md` - Complete workflow documentation


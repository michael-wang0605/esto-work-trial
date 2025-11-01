# Hyperspell Query Examples

This guide shows you how to use Hyperspell's memory/query capabilities in your property management app.

## Setup

First, make sure you have Hyperspell configured:

```python
from backend_modules.hyperspell_service import HyperspellClient

client = HyperspellClient()
user_id = "your_user_id"  # Property manager's user ID
```

---

## 1. Adding Memories (Indexing Data)

Before you can query, you need to add data to Hyperspell as "memories". Here's how to index your tenant application data:

### Example: Index a Tenant Application

```python
async def index_tenant_application(client, user_id, application):
    """
    Add a tenant application to Hyperspell so it can be queried
    """
    # Create a comprehensive text representation of the application
    text = f"""
    Tenant Application: {application['applicantName']}
    Email: {application['applicantEmail']}
    Phone: {application.get('applicantPhone', 'N/A')}
    Property: {application.get('propertyId', 'Not specified')}
    
    Credit Score: {application.get('creditScore', 'Not provided')}
    Monthly Income: ${application.get('monthlyIncome', 0):,.2f}
    Annual Income: ${application.get('annualIncome', 0):,.2f}
    Employer: {application.get('employerName', 'Not provided')}
    
    Status: {application['status']}
    Screening Score: {application.get('screeningScore', 'Not scored')}
    Screening Notes: {application.get('screeningNotes', 'None')}
    
    Background Check: {application.get('backgroundCheckResult', {})}
    
    Documents Provided:
    - Driver's License: {'Yes' if application.get('driversLicenseUrl') else 'No'}
    - Pay Stubs: {len(application.get('payStubUrls', []))} provided
    - Credit Report: {'Yes' if application.get('creditScoreUrl') else 'No'}
    
    Received: {application.get('receivedAt', 'Unknown')}
    """
    
    metadata = {
        "application_id": application['id'],
        "property_id": application.get('propertyId'),
        "applicant_email": application['applicantEmail'],
        "status": application['status'],
        "credit_score": application.get('creditScore'),
        "screening_score": application.get('screeningScore')
    }
    
    result = await client.add_memory(
        user_id=user_id,
        text=text,
        collection="tenant_applications",
        metadata=metadata
    )
    
    return result
```

### Example: Index an Email Conversation

```python
async def index_email_thread(client, user_id, email_thread, application_id):
    """
    Index an email conversation/thread
    """
    # Combine all messages in the thread
    messages_text = "\n\n".join([
        f"From: {msg.get('from', 'Unknown')}\n"
        f"Subject: {msg.get('subject', 'No subject')}\n"
        f"Date: {msg.get('date', 'Unknown')}\n"
        f"Body: {msg.get('body', '')}"
        for msg in email_thread.get('messages', [])
    ])
    
    text = f"""
    Email Thread with Applicant
    
    {messages_text}
    """
    
    result = await client.add_memory(
        user_id=user_id,
        text=text,
        collection="email_threads",
        metadata={
            "application_id": application_id,
            "thread_id": email_thread.get('thread_id'),
            "participants": [msg.get('from') for msg in email_thread.get('messages', [])]
        }
    )
    
    return result
```

### Example: Index a Lease Document

```python
async def index_lease_document(client, user_id, lease):
    """
    Index a lease document with OCR text
    """
    text = f"""
    Lease Document: {lease['originalName']}
    Property: {lease['propertyId']}
    
    Summary: {lease.get('summary', 'No summary available')}
    
    Key Terms: {lease.get('keyTerms', 'No key terms extracted')}
    
    Monthly Rent: ${lease.get('monthlyRent', 0):,.2f}
    Security Deposit: ${lease.get('securityDeposit', 0):,.2f}
    Start Date: {lease.get('startDate', 'Not specified')}
    End Date: {lease.get('endDate', 'Not specified')}
    Active: {lease.get('isActive', False)}
    """
    
    result = await client.add_memory(
        user_id=user_id,
        text=text,
        collection="leases",
        metadata={
            "lease_id": lease['id'],
            "property_id": lease['propertyId'],
            "is_active": lease.get('isActive', False)
        }
    )
    
    return result
```

---

## 2. Querying Memories

Once data is indexed, you can query it using natural language.

### Example: Find Approved Applicants

```python
async def find_approved_applicants(client, user_id):
    """
    Query: Find all approved applicants
    """
    result = await client.query(
        user_id=user_id,
        query="Show me all approved tenant applications",
        collections=["tenant_applications"],
        limit=50
    )
    
    if result["success"]:
        print(f"Found {result['count']} approved applications")
        for doc in result["documents"]:
            print(f"- {doc.get('text', '')[:100]}...")
    
    return result
```

### Example: Find High Credit Score Applicants

```python
async def find_high_credit_applicants(client, user_id, min_score=700):
    """
    Query: Find applicants with credit scores above threshold
    """
    result = await client.query(
        user_id=user_id,
        query=f"Show me all tenant applications with credit scores above {min_score}",
        collections=["tenant_applications"],
        limit=50
    )
    
    return result
```

### Example: Find Applications Needing Review

```python
async def find_applications_needing_review(client, user_id):
    """
    Query: Find applications that need review (yellow/red status or missing documents)
    """
    result = await client.query(
        user_id=user_id,
        query="Show me applications with yellow or red screening scores, or missing documents",
        collections=["tenant_applications"],
        limit=50
    )
    
    return result
```

### Example: Get AI-Generated Answer

```python
async def ask_about_applications(client, user_id, question):
    """
    Query with answer mode: Get AI-generated summary/answer
    """
    result = await client.query(
        user_id=user_id,
        query=question,
        collections=["tenant_applications"],
        answer=True,  # Enable AI answer
        limit=10
    )
    
    if result["success"]:
        print(f"Answer: {result['answer']}")
        print(f"\nBased on {len(result.get('documents', []))} documents")
    
    return result

# Usage examples:
# await ask_about_applications(client, user_id, 
#     "What's the average credit score of approved applicants?")
# await ask_about_applications(client, user_id,
#     "Which properties have the most pending applications?")
```

### Example: Search Email Conversations

```python
async def search_email_conversations(client, user_id, query):
    """
    Query: Search through email threads
    """
    result = await client.query(
        user_id=user_id,
        query=query,
        collections=["email_threads"],
        limit=20
    )
    
    return result

# Usage:
# await search_email_conversations(client, user_id, 
#     "Find emails discussing parking instructions")
# await search_email_conversations(client, user_id,
#     "What did John Smith ask about in his emails?")
```

### Example: Query Lease Information

```python
async def query_lease_info(client, user_id, property_address):
    """
    Query: Find lease information for a property
    """
    result = await client.query(
        user_id=user_id,
        query=f"What are the lease terms and pet policies for {property_address}?",
        collections=["leases"],
        answer=True  # Get a summary answer
    )
    
    return result
```

---

## 3. Real-World Use Cases

### Use Case 1: Auto-index New Applications

When a new tenant application comes in, automatically index it:

```python
from backend_modules.hyperspell_service import HyperspellClient
from backend_modules.inbox_monitor import process_incoming_email_data

async def process_and_index_application(user_id, email_data):
    # Process the email and create application (existing code)
    application = await process_incoming_email_data(...)
    
    # Index it in Hyperspell for querying
    client = HyperspellClient()
    await index_tenant_application(client, user_id, application)
    
    return application
```

### Use Case 2: Dashboard Query for "Applications Needing Attention"

```python
async def get_applications_needing_attention(user_id):
    """
    Query dashboard: Get all applications that need human review
    """
    client = HyperspellClient()
    
    # Find yellow/red applications
    result = await client.query(
        user_id=user_id,
        query="Show me applications with yellow or red screening scores from the last 7 days",
        collections=["tenant_applications"],
        limit=100
    )
    
    # Extract application IDs from metadata
    application_ids = [
        doc.get('metadata', {}).get('application_id')
        for doc in result.get('documents', [])
        if doc.get('metadata', {}).get('application_id')
    ]
    
    return application_ids
```

### Use Case 3: Property Manager Assistant

```python
async def property_manager_query(user_id, natural_language_query):
    """
    Let property managers ask questions in natural language
    """
    client = HyperspellClient()
    
    # Query across all collections
    result = await client.query(
        user_id=user_id,
        query=natural_language_query,
        collections=["tenant_applications", "email_threads", "leases"],
        answer=True,  # Get AI-generated answer
        limit=20
    )
    
    return {
        "answer": result.get("answer"),
        "sources": result.get("documents", [])
    }

# Usage:
# response = await property_manager_query(user_id, 
#     "Which applicants have the best qualifications for the Main Street property?")
# print(response["answer"])
```

---

## 4. API Endpoint Example

Here's how to add a query endpoint to your backend:

```python
# In minimal_backend.py or a new route file

from backend_modules.hyperspell_service import HyperspellClient

@app.post("/api/hyperspell/query")
async def hyperspell_query(request: Request):
    """
    Query Hyperspell memories using natural language
    """
    data = await request.json()
    user_id = data.get("user_id")
    query = data.get("query")
    collections = data.get("collections", ["tenant_applications"])
    answer = data.get("answer", False)
    
    if not user_id or not query:
        return {"error": "user_id and query are required"}
    
    client = HyperspellClient()
    result = await client.query(
        user_id=user_id,
        query=query,
        collections=collections,
        answer=answer
    )
    
    return result
```

---

## 5. Frontend Integration Example

```typescript
// In your frontend
async function queryHyperspell(query: string, answer: boolean = false) {
  const response = await fetch('/api/hyperspell/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      query: query,
      collections: ['tenant_applications', 'email_threads'],
      answer: answer
    })
  });
  
  return await response.json();
}

// Usage in a component:
const handleSearch = async () => {
  const results = await queryHyperspell(
    "Show me approved applicants with credit scores above 700",
    false  // Get documents, not AI answer
  );
  
  console.log(`Found ${results.count} results`);
  setSearchResults(results.documents);
};

const handleAskQuestion = async () => {
  const response = await queryHyperspell(
    "What's the average income of applicants this month?",
    true  // Get AI-generated answer
  );
  
  console.log(response.answer);
  setAnswer(response.answer);
};
```

---

## Quick Reference

### Add Memory (Index Data)
```python
await client.add_memory(
    user_id=user_id,
    text="Your data here",
    collection="tenant_applications",
    metadata={"key": "value"}
)
```

### Query Memories
```python
result = await client.query(
    user_id=user_id,
    query="Your natural language query",
    collections=["tenant_applications"],
    answer=False,  # False = documents, True = AI answer
    limit=10
)
```

### Collections to Use
- `"tenant_applications"` - Application data
- `"email_threads"` - Email conversations
- `"leases"` - Lease documents
- `"properties"` - Property information
- `"maintenance"` - Maintenance tickets (if you add them)

---

## Notes

- **Index data first**: You must add memories before you can query them
- **Collections organize data**: Use different collections for different data types
- **Metadata helps**: Include IDs and key fields in metadata for easy retrieval
- **Answer mode**: Use `answer=True` for summaries, `answer=False` for raw documents
- **User ID**: Each property manager should have their own user_id for data isolation


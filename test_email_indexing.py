"""
Quick test script to verify email indexing is working
Tests that emails are being read from Agentmail and indexed in Hyperspell
"""

import asyncio
import os
from backend_modules.agentmail_service import AgentmailClient
from backend_modules.hyperspell_service import HyperspellClient
from backend_modules.email_indexer import index_all_emails_from_agentmail

async def test_email_indexing():
    """Test that emails are being indexed"""
    
    # Check credentials
    agentmail_key = os.getenv("AGENTMAIL_API_KEY", "")
    hyperspell_key = os.getenv("HYPERSPELL_API_KEY", "")
    user_id = os.getenv("DEFAULT_USER_ID", "demo_user")
    inbox_id = os.getenv("AGENTMAIL_INBOX_ID", "")
    
    print("🔍 Testing Email Indexing Setup\n")
    
    # Test 1: Check Agentmail connection
    print("1️⃣ Testing Agentmail connection...")
    agentmail_client = AgentmailClient()
    if not agentmail_key:
        print("   ❌ AGENTMAIL_API_KEY not set")
    else:
        threads = await agentmail_client.list_threads(inbox_id=inbox_id)
        print(f"   ✅ Connected - Found {len(threads)} email thread(s)")
    
    # Test 2: Check Hyperspell connection
    print("\n2️⃣ Testing Hyperspell connection...")
    hyperspell_client = HyperspellClient()
    if not hyperspell_key:
        print("   ❌ HYPERSPELL_API_KEY not set")
    else:
        print("   ✅ Hyperspell API key configured")
    
    # Test 3: Index a few emails
    print("\n3️⃣ Testing email indexing...")
    if agentmail_key and hyperspell_key:
        result = await index_all_emails_from_agentmail(user_id, inbox_id, limit=5)  # Just test 5 emails
        if result.get("success"):
            print(f"   ✅ Successfully indexed {result['indexed_count']} email(s)")
        else:
            print(f"   ❌ Error: {result.get('error')}")
    else:
        print("   ⚠️ Skipping - missing credentials")
    
    # Test 4: Query Hyperspell
    print("\n4️⃣ Testing Hyperspell query...")
    if hyperspell_key:
        try:
            query_result = await hyperspell_client.query(
                user_id=user_id,
                query="Show me all emails from Agentmail",
                collections=["agentmail_emails"],
                limit=5
            )
            if query_result.get("success"):
                count = len(query_result.get("documents", []))
                print(f"   ✅ Query successful - Found {count} email(s) in Hyperspell")
            else:
                print(f"   ⚠️ Query returned no results (emails may not be indexed yet)")
        except Exception as e:
            print(f"   ❌ Query error: {e}")
    else:
        print("   ⚠️ Skipping - Hyperspell not configured")
    
    print("\n✅ Test complete!")
    print("\n💡 Tip: When webhooks are set up, emails will auto-index automatically!")
    print("   For now, you can manually index all emails:")
    print("   curl -X POST https://prop-ai.onrender.com/api/agentmail/index-all")

if __name__ == "__main__":
    asyncio.run(test_email_indexing())


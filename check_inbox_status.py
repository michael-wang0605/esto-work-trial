"""
Quick script to check Agentmail inbox status
Shows if emails have been received and processed
"""

import asyncio
import os
from backend_modules.agentmail_service import AgentmailClient
from backend_modules.hyperspell_service import HyperspellClient

async def check_inbox_status():
    """Check Agentmail inbox status"""
    
    agentmail_client = AgentmailClient()
    hyperspell_client = HyperspellClient()
    
    inbox_id = os.getenv("AGENTMAIL_INBOX_ID", "")
    user_id = os.getenv("DEFAULT_USER_ID", "default_user")
    
    print("🔍 Checking Agentmail Inbox Status\n")
    print(f"Inbox ID: {inbox_id}\n")
    
    # Check 1: List all threads
    print("1️⃣ Listing all email threads from Agentmail...")
    threads = await agentmail_client.list_threads(inbox_id=inbox_id)
    print(f"   Found {len(threads)} thread(s)\n")
    
    if not threads:
        print("   ❌ No emails found in Agentmail inbox")
        print("   💡 Send a test email to your Agentmail inbox address")
        return
    
    # Check 2: Get details for each thread
    print("2️⃣ Checking thread details...\n")
    for idx, thread in enumerate(threads[:10], 1):  # Limit to first 10
        thread_id = thread.get("thread_id") or thread.get("id")
        subject = thread.get("subject", "No subject")
        
        print(f"   Thread {idx}: {thread_id[:20]}...")
        print(f"      Subject: {subject}")
        
        # Get full thread with messages
        full_thread = await agentmail_client.get_thread(thread_id)
        if full_thread:
            messages = full_thread.get("messages", [])
            print(f"      Messages: {len(messages)}")
            
            # Check for unread messages
            unread = [m for m in messages if not m.get("read", False)]
            if unread:
                print(f"      ⚠️  {len(unread)} unread message(s)")
                for msg in unread[:3]:  # Show first 3
                    sender = msg.get("from", "") or (msg.get("from_", [""])[0] if msg.get("from_") else "")
                    print(f"         - From: {sender}")
            else:
                print(f"      ✅ All messages read")
        print()
    
    # Check 3: Query Hyperspell to see if emails are indexed
    print("3️⃣ Checking if emails are indexed in Hyperspell...")
    if hyperspell_client.api_key:
        try:
            query_result = await hyperspell_client.query(
                user_id=user_id,
                query="Show me all emails from Agentmail",
                collections=["agentmail_emails"],
                limit=10
            )
            if query_result.get("success"):
                docs = query_result.get("documents", [])
                print(f"   ✅ Found {len(docs)} email(s) indexed in Hyperspell")
                if docs:
                    print(f"   📧 Most recent emails:")
                    for doc in docs[:3]:
                        print(f"      - {doc.get('metadata', {}).get('subject', 'No subject')}")
            else:
                print(f"   ⚠️  No emails found in Hyperspell (may not be indexed yet)")
        except Exception as e:
            print(f"   ❌ Error querying Hyperspell: {e}")
    else:
        print(f"   ⚠️  Hyperspell not configured")
    
    print("\n✅ Status check complete!")
    print("\n💡 Tips:")
    print("   - If webhook is set up, new emails are processed automatically")
    print("   - Check Render logs for webhook events: '📬 Received Agentmail webhook'")
    print("   - To manually process: POST /api/agentmail/check-inbox")

if __name__ == "__main__":
    asyncio.run(check_inbox_status())


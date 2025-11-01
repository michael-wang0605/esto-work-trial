"""
Script to index ALL emails from Agentmail into Hyperspell
Run this to read all your emails and make them searchable in Hyperspell
"""

import asyncio
import os
from backend_modules.email_indexer import index_all_emails_from_agentmail

async def main():
    user_id = os.getenv("DEFAULT_USER_ID", "demo_user")
    inbox_id = os.getenv("AGENTMAIL_INBOX_ID", "")
    
    print("📬 Starting email indexing...")
    print(f"   User ID: {user_id}")
    print(f"   Inbox ID: {inbox_id or 'All inboxes'}\n")
    
    result = await index_all_emails_from_agentmail(user_id, inbox_id)
    
    if result.get("success"):
        print(f"\n✅ Successfully indexed {result['indexed_count']} emails in Hyperspell!")
        print(f"\n🎯 You can now query all your emails with:")
        print(f"   - 'Show me all emails about tenant applications'")
        print(f"   - 'Find emails from john@example.com'")
        print(f"   - 'What did the applicant say about parking?'")
    else:
        print(f"\n❌ Error: {result.get('error')}")

if __name__ == "__main__":
    asyncio.run(main())


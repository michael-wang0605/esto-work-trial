"""
Email Indexing Service
Reads ALL emails from Agentmail and indexes them in Hyperspell
This creates a searchable memory of all your emails
"""

import os
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend_modules.agentmail_service import AgentmailClient
from backend_modules.hyperspell_service import HyperspellClient

# Track indexed emails to avoid duplicates
indexed_email_ids = set()


async def index_all_emails_from_agentmail(
    user_id: str,
    inbox_id: Optional[str] = None,
    limit: Optional[int] = None
) -> Dict[str, Any]:
    """
    Read ALL emails from Agentmail and index them in Hyperspell
    
    Args:
        user_id: User ID for Hyperspell
        inbox_id: Optional specific inbox ID (if None, reads all)
        limit: Optional limit on number of emails to index
    
    Returns:
        Dict with summary of indexing results
    """
    agentmail_client = AgentmailClient()
    hyperspell_client = HyperspellClient()
    
    if not hyperspell_client.api_key:
        print("⚠️ HYPERSPELL_API_KEY not set - cannot index emails")
        return {"success": False, "error": "Hyperspell not configured"}
    
    print(f"📬 Reading all emails from Agentmail...")
    print(f"   User ID: {user_id}")
    print(f"   Inbox ID: {inbox_id or 'All inboxes'}\n")
    
    try:
        # Get all threads from Agentmail
        threads = await agentmail_client.list_threads(inbox_id=inbox_id)
        
        if limit:
            threads = threads[:limit]
        
        print(f"📧 Found {len(threads)} email thread(s)")
        
        indexed_count = 0
        skipped_count = 0
        error_count = 0
        
        for idx, thread in enumerate(threads):
            thread_id = thread.get("thread_id") or thread.get("id")
            
            # Get full thread details with all messages
            try:
                full_thread = await agentmail_client.get_thread(thread_id)
                if not full_thread:
                    skipped_count += 1
                    continue
                
                messages = full_thread.get("messages", [])
                if not messages:
                    skipped_count += 1
                    continue
                
                # Index each message in the thread
                for message in messages:
                    message_id = message.get("message_id") or message.get("id")
                    
                    # Skip if already indexed
                    if message_id in indexed_email_ids:
                        continue
                    
                    # Create email text representation for Hyperspell
                    email_from = message.get("from", {})
                    if isinstance(email_from, dict):
                        from_email = email_from.get("email", "unknown")
                        from_name = email_from.get("name", "")
                    else:
                        from_email = str(email_from)
                        from_name = ""
                    
                    email_subject = message.get("subject", full_thread.get("subject", "No Subject"))
                    email_body = message.get("body", message.get("text", ""))
                    email_date = message.get("date", message.get("created_at", datetime.now().isoformat()))
                    
                    # Create comprehensive text for indexing
                    email_text = f"""
                    Email from Agentmail
                    
                    From: {from_name} ({from_email})
                    To: {message.get('to', 'N/A')}
                    Subject: {email_subject}
                    Date: {email_date}
                    
                    Body:
                    {email_body[:2000]}  # Limit to first 2000 chars
                    """
                    
                    # Index in Hyperspell
                    try:
                        memory_result = await hyperspell_client.add_memory(
                            user_id=user_id,
                            text=email_text,
                            collection="agentmail_emails",  # Separate collection for all emails
                            metadata={
                                "email_id": message_id,
                                "thread_id": thread_id,
                                "from_email": from_email,
                                "from_name": from_name,
                                "subject": email_subject,
                                "date": email_date,
                                "is_application": "tenant" in email_subject.lower() or "application" in email_subject.lower() or "rent" in email_subject.lower(),
                                "indexed_at": datetime.now().isoformat()
                            }
                        )
                        
                        if memory_result.get("success"):
                            indexed_email_ids.add(message_id)
                            indexed_count += 1
                            print(f"✅ [{idx+1}/{len(threads)}] Indexed: {email_subject[:50]}... from {from_email}")
                        else:
                            error_count += 1
                            print(f"⚠️ Failed to index email: {memory_result.get('error')}")
                    except Exception as index_error:
                        error_count += 1
                        print(f"❌ Error indexing email {message_id}: {index_error}")
                    
                    # Small delay to avoid rate limits
                    await asyncio.sleep(0.3)
                
            except Exception as thread_error:
                error_count += 1
                print(f"❌ Error processing thread {thread_id}: {thread_error}")
            
            # Progress update
            if (idx + 1) % 10 == 0:
                print(f"   Progress: {idx+1}/{len(threads)} threads processed...")
        
        print(f"\n📊 Indexing Summary:")
        print(f"   ✅ Successfully indexed: {indexed_count} emails")
        print(f"   ⏭️  Skipped: {skipped_count}")
        print(f"   ❌ Errors: {error_count}")
        
        return {
            "success": True,
            "indexed_count": indexed_count,
            "skipped_count": skipped_count,
            "error_count": error_count,
            "total_threads": len(threads)
        }
        
    except Exception as e:
        print(f"❌ Error reading emails from Agentmail: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


async def index_new_emails_continuously(user_id: str, interval_seconds: int = 300):
    """
    Continuously monitor Agentmail and index new emails in Hyperspell
    Runs every interval_seconds (default: 5 minutes)
    
    Args:
        user_id: User ID for Hyperspell
        interval_seconds: How often to check for new emails
    """
    print(f"🔄 Starting continuous email indexing (checking every {interval_seconds} seconds)...")
    
    while True:
        try:
            # Index new emails only (will skip already indexed ones)
            result = await index_all_emails_from_agentmail(user_id)
            
            if result.get("success"):
                new_count = result.get("indexed_count", 0)
                if new_count > 0:
                    print(f"✅ Indexed {new_count} new email(s) in Hyperspell")
                else:
                    print(f"📭 No new emails to index")
            
            # Wait before next check
            print(f"⏳ Waiting {interval_seconds} seconds before next check...")
            await asyncio.sleep(interval_seconds)
            
        except Exception as e:
            print(f"❌ Error in continuous indexing: {e}")
            # Wait a bit before retrying
            await asyncio.sleep(60)  # Wait 1 minute on error


async def index_single_email_thread(user_id: str, thread_id: str) -> Dict[str, Any]:
    """
    Index a single email thread in Hyperspell
    
    Args:
        user_id: User ID for Hyperspell
        thread_id: Agentmail thread ID
    
    Returns:
        Dict with indexing result
    """
    agentmail_client = AgentmailClient()
    hyperspell_client = HyperspellClient()
    
    try:
        # Get thread
        thread = await agentmail_client.get_thread(thread_id)
        if not thread:
            return {"success": False, "error": "Thread not found"}
        
        messages = thread.get("messages", [])
        indexed_count = 0
        
        for message in messages:
            message_id = message.get("message_id") or message.get("id")
            
            # Skip if already indexed
            if message_id in indexed_email_ids:
                continue
            
            # Create email text
            email_from = message.get("from", {})
            if isinstance(email_from, dict):
                from_email = email_from.get("email", "unknown")
                from_name = email_from.get("name", "")
            else:
                from_email = str(email_from)
                from_name = ""
            
            email_subject = message.get("subject", thread.get("subject", "No Subject"))
            email_body = message.get("body", message.get("text", ""))
            
            email_text = f"""
            Email from Agentmail
            
            From: {from_name} ({from_email})
            Subject: {email_subject}
            
            Body:
            {email_body[:2000]}
            """
            
            # Index in Hyperspell
            memory_result = await hyperspell_client.add_memory(
                user_id=user_id,
                text=email_text,
                collection="agentmail_emails",
                metadata={
                    "email_id": message_id,
                    "thread_id": thread_id,
                    "from_email": from_email,
                    "from_name": from_name,
                    "subject": email_subject,
                    "indexed_at": datetime.now().isoformat()
                }
            )
            
            if memory_result.get("success"):
                indexed_email_ids.add(message_id)
                indexed_count += 1
        
        return {
            "success": True,
            "indexed_count": indexed_count,
            "thread_id": thread_id
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


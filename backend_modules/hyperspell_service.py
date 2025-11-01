"""
Hyperspell service for tenant application ranking and memory queries
Handles natural language queries and memory storage via Hyperspell API
Used for tenant best-fit selection by ranking applicants based on credit score, income, and other criteria
"""

import os
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime

HYPERSPELL_API_KEY = os.getenv("HYPERSPELL_API_KEY", "")
HYPERSPELL_API_URL = os.getenv("HYPERSPELL_API_URL", "https://api.hyperspell.com")

class HyperspellClient:
    """
    Client for Hyperspell API - used for tenant application ranking and queries
    
    Features:
    - Store tenant application data in memory
    - Query and rank applicants by credit score, income ratio, etc.
    - Natural language queries to find best-fit tenants
    """
    
    def __init__(self):
        self.api_key = HYPERSPELL_API_KEY
        self.api_url = HYPERSPELL_API_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def add_memory(
        self,
        user_id: str,
        text: str,
        collection: str = "tenant_applications",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Add a memory (data) to Hyperspell for later querying
        
        Args:
            user_id: User ID to associate this memory with
            text: Text content to index
            collection: Collection name to organize memories (default: "tenant_applications")
            metadata: Optional metadata (e.g., application_id, property_id, etc.)
        
        Returns:
            Dict with resource_id if successful
        """
        if not self.api_key:
            print("⚠️ Hyperspell credentials not configured")
            return {"success": False, "error": "Hyperspell not configured"}
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                url = f"{self.api_url}/memories/add"
                payload = {
                    "user_id": user_id,
                    "text": text,
                    "collection": collection,
                }
                if metadata:
                    payload["metadata"] = metadata
                
                response = await client.post(url, headers=self.headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return {
                    "success": True,
                    "resource_id": data.get("resource_id"),
                    "data": data
                }
        except Exception as e:
            print(f"❌ Error adding memory to Hyperspell: {e}")
            return {"success": False, "error": str(e)}
    
    async def query(
        self,
        user_id: str,
        query: str,
        collections: Optional[List[str]] = None,
        answer: bool = False,
        limit: int = 10,
        data_sources: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Query memories using natural language
        
        Args:
            user_id: User ID to query memories for
            query: Natural language query (e.g., "Show me approved applicants with credit above 700")
            collections: List of collections to search (default: ["tenant_applications"])
            answer: If True, return AI-generated answer instead of documents
            limit: Maximum number of results to return
            data_sources: Data sources to search (e.g., ["vault", "crawler"])
        
        Returns:
            Dict with documents/results or answer
        """
        if not self.api_key:
            print("⚠️ Hyperspell credentials not configured")
            return {"success": False, "error": "Hyperspell not configured", "results": []}
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                url = f"{self.api_url}/memories/search"
                
                # Default to vault searches if no data sources specified
                sources = data_sources or ["vault"]
                collections_to_search = collections or ["tenant_applications"]
                
                payload = {
                    "user_id": user_id,
                    "query": query,
                    "sources": sources,
                    "answer": answer,
                    "limit": limit
                }
                
                # Add collection options for vault searches
                if "vault" in sources:
                    payload["options"] = {
                        "vault": {
                            "collections": collections_to_search
                        }
                    }
                
                response = await client.post(url, headers=self.headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                if answer:
                    return {
                        "success": True,
                        "answer": data.get("answer"),
                        "documents": data.get("documents", []),
                        "sources": data.get("sources", [])
                    }
                else:
                    return {
                        "success": True,
                        "documents": data.get("documents", []),
                        "results": data.get("results", []),
                        "count": len(data.get("documents", []))
                    }
        except Exception as e:
            print(f"❌ Error querying Hyperspell: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": str(e), "results": []}


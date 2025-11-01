#!/usr/bin/env python3
"""
Startup script for PropAI Unified Backend
Handles both development and production modes
"""

import os
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    """Start the unified backend server"""
    import uvicorn
    
    # Use minimal backend (no database dependencies)
    from minimal_backend import app
    print("Using minimal backend")
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print("Starting PropAI Unified Backend...")
    print(f"Server: http://{host}:{port}")
    print(f"Reload: {reload}")
    print(f"Database: {os.getenv('DATABASE_URL', 'Not set')[:50]}...")
    print("-" * 50)
    
    # Production optimizations
    if not reload:  # Production mode
        uvicorn.run(
            app,
            host=host,
            port=port,
            workers=1,
            log_level="info",
            access_log=True
        )
    else:  # Development mode
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )

if __name__ == "__main__":
    main()

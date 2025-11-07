"""
Database Connection Management

Handles MongoDB connection and provides database client.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from typing import Optional

from app.core.config import settings
from app.models.project import Project


# Global database client
_client: Optional[AsyncIOMotorClient] = None


async def init_db():
    """Initialize database connection and Beanie ODM"""
    global _client
    
    try:
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Initialize Beanie with the Project model
        await init_beanie(
            database=_client[settings.MONGODB_DB_NAME],
            document_models=[Project],
        )
        
        print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        # Don't crash the app if MongoDB is not available
        pass


async def close_db():
    """Close database connection"""
    global _client
    
    if _client:
        _client.close()
        print("✅ MongoDB connection closed")


def get_db_client() -> Optional[AsyncIOMotorClient]:
    """Get the database client"""
    return _client

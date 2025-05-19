import os
import databases
import sqlalchemy
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Detailed debug logs
logger = logging.getLogger(__name__)

# SQLite database URL
DATABASE_URL = "sqlite:///./devlog.db"

# Database instance
database = databases.Database(DATABASE_URL)

# SQLAlchemy
metadata = sqlalchemy.MetaData()

# Ensure the database directory exists
os.makedirs(os.path.dirname(DATABASE_URL.replace("sqlite:///", "")), exist_ok=True)

# Define tables
logs = sqlalchemy.Table(
    "logs",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("content", sqlalchemy.Text, nullable=False),
    sqlalchemy.Column("date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("mood", sqlalchemy.String),  # 😊, 😐, 😫
    sqlalchemy.Column("time_spent", sqlalchemy.Integer),  # Minutes spent coding
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, default=datetime.utcnow),
)

tags = sqlalchemy.Table(
    "tags",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String, unique=True),
)

log_tags = sqlalchemy.Table(
    "log_tags",
    metadata,
    sqlalchemy.Column("log_id", sqlalchemy.ForeignKey("logs.id"), primary_key=True),
    sqlalchemy.Column("tag_id", sqlalchemy.ForeignKey("tags.id"), primary_key=True),
)

# Create SQLite engine
engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# Pydantic models for request/response
class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int

class LogBase(BaseModel):
    title: str
    content: str
    date: Optional[datetime] = None
    mood: Optional[str]
    time_spent: Optional[int]
    tags: Optional[List[str]] = []

class Log(LogBase):
    id: int
    date: datetime
    created_at: datetime

# Database functions
async def connect_db():
    """Connect to the database and create tables"""
    try:
        logger.debug("Creating database tables if not exist")
        metadata.create_all(engine)
        logger.debug("Database tables created successfully")
        
        logger.debug("Connecting to database")
        await database.connect()
        logger.debug("Connected to database successfully")
        
        # logger.debug("Initializing default data if needed")
        # await _initialize_default_data()
        
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

# async def _initialize_default_data():
#     """Initialize the database with some default data if empty"""
#     try:
#         logger.debug("Checking if logs table is empty")
#         query = "SELECT COUNT(*) as count FROM logs"
#         result = await database.fetch_one(query)
        
#         if result and result['count'] == 0:
#             logger.debug("Logs table empty, inserting sample data")
#             sample_log = {
#                 "title": "Welcome to DevLog!",
#                 "content": "This is your first log entry. Start tracking your development journey!",
#                 "date": datetime.utcnow(),
#                 "mood": "😊",
#                 "time_spent": 0
#             }
            
#             log_id = await database.execute(
#                 logs.insert().values(**sample_log)
#             )
            
#             sample_tags = ["welcome", "getting-started"]
#             for tag_name in sample_tags:
#                 tag_id = await database.execute(
#                     tags.insert().values(name=tag_name)
#                 )
#                 await database.execute(
#                     log_tags.insert().values(log_id=log_id, tag_id=tag_id)
#                 )
                
#             logger.debug("Initialized database with sample data")
            
#     except Exception as e:
#         logger.error(f"Error initializing default data: {e}")
#         # Not critical, so don't raise

async def disconnect_db():
    """Disconnect from the database"""
    try:
        logger.debug("Disconnecting from database")
        await database.disconnect()
        logger.debug("Disconnected from database")
    except Exception as e:
        logger.error(f"Error disconnecting from database: {e}")
        raise

from pydantic import parse_obj_as

async def create_log(log: LogBase) -> Log:
    """Create a new log entry with tags"""
    async with database.transaction():
        logger.debug(f"Creating log: {log.title}")
        current_time = datetime.utcnow()
        query = logs.insert().values(
            title=log.title,
            content=log.content,
            date=log.date or current_time,
            mood=log.mood,
            time_spent=log.time_spent,
            created_at=current_time
        )
        log_id = await database.execute(query)

        for tag_name in log.tags:
            tag_query = tags.select().where(tags.c.name == tag_name)
            tag = await database.fetch_one(tag_query)
            
            if not tag:
                tag_id = await database.execute(
                    tags.insert().values(name=tag_name)
                )
            else:
                tag_id = tag['id']
            
            await database.execute(
                log_tags.insert().values(log_id=log_id, tag_id=tag_id)
            )

        log_dict = await get_log(log_id)
        logger.debug(f"Log created with ID: {log_id}")
        return parse_obj_as(Log, log_dict)

async def get_log(log_id: int) -> Optional[Log]:
    """Get a single log entry by ID with its tags"""
    query = """
    SELECT l.id, l.title, l.content, l.date, l.mood, l.time_spent, l.created_at, GROUP_CONCAT(t.name) as tag_names
    FROM logs l
    LEFT JOIN log_tags lt ON l.id = lt.log_id
    LEFT JOIN tags t ON lt.tag_id = t.id
    WHERE l.id = :log_id
    GROUP BY l.id
    """
    logger.debug(f"Fetching log with ID: {log_id}")
    log = await database.fetch_one(query=query, values={"log_id": log_id})
    
    if log:
        tags = log['tag_names'].split(',') if log['tag_names'] else []
        return {**dict(log), "tags": tags}
    return None

async def get_logs(skip: int = 0, limit: int = 10) -> List[Log]:
    """Get multiple log entries with pagination"""
    query = """
    SELECT l.id, l.title, l.content, l.date, l.mood, l.time_spent, l.created_at, GROUP_CONCAT(t.name) as tag_names
    FROM logs l
    LEFT JOIN log_tags lt ON l.id = lt.log_id
    LEFT JOIN tags t ON lt.tag_id = t.id
    GROUP BY l.id
    ORDER BY l.date DESC
    LIMIT :limit OFFSET :skip
    """
    logger.debug(f"Fetching logs with skip={skip} and limit={limit}")
    logs = await database.fetch_all(
        query=query,
        values={"skip": skip, "limit": limit}
    )
    
    return [
        {**dict(log), "tags": log['tag_names'].split(',') if log['tag_names'] else []}
        for log in logs
    ]

async def get_tags() -> List[Tag]:
    """Get all available tags"""
    query = tags.select()
    logger.debug("Fetching all tags")
    return await database.fetch_all(query)

async def get_stats():
    """Get learning statistics"""
    query = """
    SELECT 
        COUNT(*) as total_logs,
        SUM(time_spent) as total_time,
        AVG(time_spent) as avg_time_per_log,
        (
            SELECT GROUP_CONCAT(name)
            FROM (
                SELECT t.name, COUNT(*) as tag_count
                FROM tags t
                JOIN log_tags lt ON t.id = lt.tag_id
                GROUP BY t.name
                ORDER BY tag_count DESC
                LIMIT 3
            ) top_tags
        ) as top_tags
    FROM logs
    """
    logger.debug("Fetching stats")
    return await database.fetch_one(query)

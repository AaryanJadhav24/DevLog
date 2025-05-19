from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from starlette.status import HTTP_204_NO_CONTENT
from database import database, logs, log_tags


from database import (
    create_log,
    get_log,
    get_logs,
    get_tags,
    get_stats,
    LogBase,
    Log
)
from ai_helper import get_learning_suggestions, get_mood_insights

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Welcome to DevLog API"}

@router.post("/logs/", response_model=Log)
async def create_log_entry(log: LogBase):
    try:
        return await create_log(log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/")
async def read_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        logs = await get_logs(skip=skip, limit=limit)
        return JSONResponse(content=jsonable_encoder(logs))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{log_id}", response_model=Log)
async def read_log(log_id: int):
    try:
        log = await get_log(log_id)
        if log is None:
            raise HTTPException(status_code=404, detail="Log not found")
        return log
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tags/")
async def read_tags():
    try:
        return await get_tags()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/")
async def read_stats():
    try:
        stats = await get_stats()
        return JSONResponse(content=jsonable_encoder(stats))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai/suggestions/")
async def get_suggestions():
    try:
        recent_logs = await get_logs(skip=0, limit=50)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_logs = [
            log for log in recent_logs 
            if datetime.fromisoformat(log['date'].replace('Z', '+00:00')) >= seven_days_ago
        ]
        if not recent_logs:
            return JSONResponse(content={
                "suggestion": "Start logging your coding activities to get personalized suggestions!"
            })
        # Mock suggestion to improve performance
        # suggestion = await get_learning_suggestions(recent_logs)
        suggestion = "Keep up the great work! Focus on practicing consistent coding habits."
        return JSONResponse(content={"suggestion": suggestion})
    except Exception as e:
        return JSONResponse(
            content={"suggestion": "Unable to generate suggestions at the moment."},
            status_code=200
        )

@router.get("/ai/mood-insights/")
async def get_mood_analysis():
    try:
        logs = await get_logs(skip=0, limit=50)
        if not logs:
            return {
                "insight": "Start logging your moods during coding sessions to get insights!"
            }
        # Mock insight to improve performance
        # insight = await get_mood_insights(logs)
        insight = "Your mood patterns show positive engagement during focused coding sessions."
        return {"insight": insight}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/logs/{log_id}", status_code=HTTP_204_NO_CONTENT)
async def delete_log(log_id: int):
    # Delete log-tag associations first
    delete_log_tags_query = log_tags.delete().where(log_tags.c.log_id == log_id)
    await database.execute(delete_log_tags_query)

    # Delete the log itself
    delete_log_query = logs.delete().where(logs.c.id == log_id)
    result = await database.execute(delete_log_query)

    if result is None:
        raise HTTPException(status_code=404, detail="Log not found")

    return None
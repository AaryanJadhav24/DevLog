import os
import httpx
from typing import Dict, List
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

async def get_learning_suggestions(recent_logs: List[Dict]) -> str:
    """
    Analyze recent logs and provide learning suggestions using OpenRouter GPT.
    
    Args:
        recent_logs: List of recent log entries with their tags and time spent
    
    Returns:
        str: AI-generated learning suggestion
    """
    try:
        # Prepare the context from recent logs
        log_summary = _prepare_log_summary(recent_logs)
        
        # Construct the prompt
        prompt = f"""
        As a developer mentor, analyze these recent coding activities and provide a brief, 
        specific suggestion for what to focus on next:

        Recent Activity Summary:
        {log_summary}

        Provide a short, specific suggestion focusing on:
        1. Any skill gaps or areas needing attention
        2. What to learn or practice next
        3. A specific, actionable next step

        Keep the response under 100 words and friendly but professional.
        """

        # Make API call to OpenRouter
        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a helpful developer mentor."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 150,
                    "temperature": 0.7
                },
                timeout=10.0
            )
            
            response.raise_for_status()
            suggestion = response.json()["choices"][0]["message"]["content"]
            return suggestion.strip()

    except Exception as e:
        print(f"Error getting AI suggestion: {e}")
        return "I'm having trouble analyzing your recent activities. Please try again later."

def _prepare_log_summary(logs: List[Dict]) -> str:
    """
    Prepare a summary of recent logs for the AI prompt.
    """
    summary = []
    
    # Group logs by day
    days_summary = {}
    for log in logs:
        try:
            # Convert string date to datetime object
            log_date = datetime.fromisoformat(log['date'].replace('Z', '+00:00')).date()
            
            if log_date not in days_summary:
                days_summary[log_date] = {
                    'tags': set(),
                    'total_time': 0,
                    'count': 0
                }
            
            days_summary[log_date]['tags'].update(log.get('tags', []))
            days_summary[log_date]['total_time'] += log.get('time_spent', 0) or 0
            days_summary[log_date]['count'] += 1
        except (KeyError, ValueError) as e:
            print(f"Error processing log: {e}")
            continue

    # Create summary text
    for date, data in sorted(days_summary.items()):
        tags_str = ", ".join(sorted(data['tags'])) if data['tags'] else "no tags"
        hours = data['total_time'] / 60 if data['total_time'] else 0
        summary.append(
            f"Date: {date}: {data['count']} entries, {hours:.1f}h spent on: {tags_str}"
        )

    return "\n".join(summary)

async def get_mood_insights(logs: List[Dict]) -> str:
    """
    Analyze mood patterns in relation to coding activities.
    
    Args:
        logs: List of log entries with mood and tags
    
    Returns:
        str: AI-generated mood insight
    """
    try:
        # Prepare mood analysis
        mood_summary = _prepare_mood_summary(logs)
        
        prompt = f"""
        Analyze these coding session moods and provide a brief, constructive insight:

        Mood Summary:
        {mood_summary}

        Provide a short, encouraging observation about:
        1. Any patterns between activities and mood
        2. A positive suggestion for maintaining good mood while coding
        
        Keep it brief, supportive, and actionable.
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a supportive developer mentor."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 100,
                    "temperature": 0.7
                },
                timeout=10.0
            )
            
            response.raise_for_status()
            insight = response.json()["choices"][0]["message"]["content"]
            return insight.strip()

    except Exception as e:
        print(f"Error getting mood insight: {e}")
        return "Unable to analyze mood patterns at the moment. Please try again later."

def _prepare_mood_summary(logs: List[Dict]) -> str:
    """
    Prepare a summary of mood patterns for the AI prompt.
    """
    mood_by_tag = {}
    
    for log in logs:
        mood = log.get('mood')
        if not mood:
            continue
            
        for tag in log['tags']:
            if tag not in mood_by_tag:
                mood_by_tag[tag] = {'😊': 0, '😐': 0, '😫': 0}
            mood_by_tag[tag][mood] = mood_by_tag[tag].get(mood, 0) + 1

    summary = []
    for tag, moods in mood_by_tag.items():
        mood_str = ", ".join([f"{m}: {c}" for m, c in moods.items() if c > 0])
        summary.append(f"{tag}: {mood_str}")

    return "\n".join(summary)

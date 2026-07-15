import os
import json
import threading
from datetime import datetime
from backend.config import DATA_DIR, DATA_FILE

# Mutex to prevent race conditions during file write operations
_file_lock = threading.Lock()

def init_storage():
    """Initializes the data directory and scores file if they do not exist."""
    with _file_lock:
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR, exist_ok=True)
        
        if not os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f, indent=2)

def get_scores(limit=10):
    """Retrieves high scores sorted in descending order."""
    init_storage()
    try:
        with _file_lock:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                scores = json.load(f)
            
            # Sort by score (descending), then by date (descending)
            scores.sort(key=lambda x: (x.get('score', 0), x.get('date', '')), reverse=True)
            return scores[:limit]
    except Exception as e:
        print(f"Error reading scores: {e}")
        return []

def add_score(name, score):
    """Appends a new score, sorts, and limits to the top 10 scores."""
    init_storage()
    if not name or not isinstance(score, (int, float)):
        return False, "Invalid score or name payload"
    
    new_entry = {
        "name": str(name).strip()[:15], # Limit name to 15 chars
        "score": int(score),
        "date": datetime.now().isoformat()
    }
    
    try:
        with _file_lock:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                scores = json.load(f)
            
            scores.append(new_entry)
            # Sort descending
            scores.sort(key=lambda x: (x.get('score', 0), x.get('date', '')), reverse=True)
            
            # Keep top 10
            scores = scores[:10]
            
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(scores, f, indent=2)
            
            return True, new_entry
    except Exception as e:
        print(f"Error writing score: {e}")
        return False, str(e)

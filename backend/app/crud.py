# app/crud.py
from sqlalchemy.orm import Session
from .models import GameFactor
from typing import Dict

def get_game_factors_dict(db: Session) -> Dict[str, float]:
    """
    Fetches all game factors from the DB and returns them as a dictionary.
    Keys are lowercase game names.
    """
    factors_list = db.query(GameFactor.game_name, GameFactor.yaw_multiplier).all()
    
    # Convert name to lowercase and multiplier to float
    factors_dict = {
        name.lower(): float(multiplier) 
        for name, multiplier in factors_list
    }
    return factors_dict
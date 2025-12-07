# app/api/endpoints.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import*
from ..schemas import *

router = APIRouter()

# Scaling constant based on engine mechanics (crucial for accurate cm/360)
K_CM_360 = 1955.8

@router.get("/games", response_model=GameListResponse)
def get_available_games(db: Session = Depends(get_db)):
    """Fetches and returns a list of all available game names."""
    factors = get_game_factors_dict(db)
    # Capitalize the names for better UI presentation
    game_names = [name.capitalize() for name in factors.keys()]
    return GameListResponse(games=game_names)


@router.post("/convert_sensitivity", response_model=ConversionResult)
def convert_sensitivity(request: SensitivityRequest, db: Session = Depends(get_db)):
    """
    Calculates the target sensitivity by matching the cm/360 value.
    """
    
    game_factors = get_game_factors_dict(db)
    
    src_game = request.source_game.lower()
    tgt_game = request.target_game.lower()
    
    # ... (Input Validation remains the same) ...
    
    src_factor = game_factors[src_game]
    tgt_factor = game_factors[tgt_game]

    # --- 1. Calculate Universal Sensitivity Factor (F_uni) ---
    # The term (DPI * Sensitivity * Factor) is the physical mouse input.
    universal_sensitivity_factor = request.source_mouse_dpi * request.source_sensitivity * src_factor
    
    if universal_sensitivity_factor <= 0:
        raise HTTPException(status_code=400, detail="DPI and Sensitivity must be positive.")

    # --- 2. Calculate Target Sensitivity ---
    # The new sensitivity setting required to maintain F_uni in the target game.
    target_sensitivity = universal_sensitivity_factor / (request.target_mouse_dpi * tgt_factor)
    
    # --- 3. Calculate cm/360 (Physical Distance) ---
    # K_CM_360 constant ensures this calculation provides the correct physical distance in cm.
    cm_360 = K_CM_360 / universal_sensitivity_factor
    in_360 = cm_360 / 2.54

    return ConversionResult(
        target_sensitivity=round(target_sensitivity, 4),
        cm_360=round(cm_360, 2),
        in_360=round(in_360, 2),
    )
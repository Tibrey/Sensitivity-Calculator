from pydantic import BaseModel
from typing import List

# --- Request/Response Schemas ---

class SensitivityRequest(BaseModel):
    source_game: str
    target_game: str
    source_sensitivity: float
    source_mouse_dpi: int
    target_mouse_dpi: int

class ConversionResult(BaseModel):
    target_sensitivity: float
    cm_360: float
    in_360: float
    
class GameListResponse(BaseModel):
    games: List[str]    
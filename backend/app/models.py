from sqlalchemy import Column, Integer, String, Numeric, DateTime, func
from .database import Base

class GameFactor(Base):
    """
    SQLAlchemy model for game-specific conversion factors.
    """
    __tablename__ = "game_factors"

    id = Column(Integer, primary_key=True, index=True)
    game_name = Column(String, unique=True, index=True, nullable=False)
    # Yaw_Multiplier is stored as a precise Numeric type
    yaw_multiplier = Column(Numeric(10, 8), nullable=False) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# NOTE: You still need to run the SQL commands from the previous answer
# to create the table and insert the initial data into PostgreSQL.
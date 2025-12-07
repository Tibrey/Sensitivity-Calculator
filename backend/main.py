# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.database import Base, engine # <-- IMPORT BASE AND ENGINE
from app.models import GameFactor # <-- IMPORT YOUR MODEL
from sqlalchemy.orm import Session
from app.database import SessionLocal

app = FastAPI(title="FPS Sensitivity API")

# --- CORS Configuration ---
origins = ["http://localhost:5173", "http://127.0.0.1:5173"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE INITIALIZATION AND SEEDING ---
# This function runs ONCE when the FastAPI server starts.
def create_tables_and_seed_data():
    """
    1. Creates all tables defined by Base (if they don't exist).
    2. Inserts initial conversion factors (seeding).
    """
    # 1. Create Tables
    # This checks all models inheriting from Base and creates them in the DB
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
    
    # 2. Seed Initial Data
    db = SessionLocal()
    try:
        # Define the data to be inserted
        initial_factors = [
            # 0.07 is the common Valorant factor for conversion
            {'game_name': 'Valorant', 'yaw_multiplier': 0.07000000},         
            # 0.022 is the internal Source Engine factor
            {'game_name': 'CSGO', 'yaw_multiplier': 0.02200000},             
            {'game_name': 'Apex Legends', 'yaw_multiplier': 0.02200000},     
            # 0.0033333333 is the correct factor for Overwatch
            {'game_name': 'Overwatch', 'yaw_multiplier': 0.00333333},  

            # Battle Royale / Large Scale 
            {'game_name': 'Fortnite', 'yaw_multiplier': 0.01111100},
            {'game_name': 'PUBG', 'yaw_multiplier': 0.02200000},

            # Battlefield Series (BFV, 2042, etc.) - Uses unique scaling factor
            {'game_name': 'Battlefield', 'yaw_multiplier': 2.29183100},      
            
            # Other Major Titles
            {'game_name': 'Destiny 2', 'yaw_multiplier': 0.13888888},
            {'game_name': 'Call of Duty', 'yaw_multiplier': 0.00666666},      
        ]
        
        for data in initial_factors:
            # Check if the factor already exists to prevent duplicate entries
            exists = db.query(GameFactor).filter(GameFactor.game_name == data['game_name']).first()
            if not exists:
                factor = GameFactor(**data)
                db.add(factor)
                print(f"Seeded: {data['game_name']}")
        
        db.commit()
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

# Attach the initialization function to the application startup event
@app.on_event("startup")
def startup_event():
    create_tables_and_seed_data()

# --- ROUTER INCLUSION ---
app.include_router(endpoints.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
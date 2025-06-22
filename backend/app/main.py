# FastAPI app setup + route registration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import analyzer
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS enable kar rahe hain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Analyzer route register
app.include_router(analyzer.router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.model_registry import list_models
from app.schemas import ModelInfo

app = FastAPI()

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/models", response_model=list[ModelInfo])
def get_models() -> list[ModelInfo]:
    """
    Returns a list of all available models in the registry.
    """
    return list_models()

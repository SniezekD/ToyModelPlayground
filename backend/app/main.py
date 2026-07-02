from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.model_registry import list_models
from app.run_service import create_run, get_run
from app.schemas import ModelInfo, RunCreateRequest, RunInfo

app = FastAPI()

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
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


@app.post("/runs", response_model=RunInfo)
def post_run(request: RunCreateRequest) -> RunInfo:
    return create_run(request=request)


@app.get("/runs/{run_id}", response_model=RunInfo)
def get_run_by_id(run_id: str) -> RunInfo:
    return get_run(run_id=run_id)

from typing import Literal

from pydantic import BaseModel


class ModelParameter(BaseModel):
    name: str
    type: Literal["integer"]
    default: int
    minimum: int
    maximum: int


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    parameters: list[ModelParameter]


class RunCreateRequest(BaseModel):
    model_id: str
    parameters: dict[str, int]


class RunResult(BaseModel):
    summary: str
    grid_width: int
    grid_height: int
    steps_completed: int
    alive_cells: int
    final_grid: list[list[int]]


class RunInfo(BaseModel):
    id: str
    model_id: str
    status: Literal["created", "completed"]
    parameters: dict[str, int]
    result: RunResult | None = None

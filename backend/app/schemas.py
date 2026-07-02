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


class RunInfo(BaseModel):
    id: str
    model_id: str
    status: Literal["created"]
    parameters: dict[str, int]

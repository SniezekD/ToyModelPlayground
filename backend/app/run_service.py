from uuid import uuid4

from fastapi import HTTPException

from app.model_registry import get_model
from app.schemas import ModelInfo, RunCreateRequest, RunInfo

RUNS: dict[str, RunInfo] = {}


def create_run(request: RunCreateRequest) -> RunInfo:
    model = get_model(request.model_id)
    if model is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown model: {request.model_id}",
        )

    validated_params = validate_parameters(model, request.parameters)

    run = RunInfo(
        id=str(uuid4()),
        model_id=model.id,
        status="created",
        parameters=validated_params,
    )

    RUNS[run.id] = run

    return run


def get_run(run_id: str) -> RunInfo:
    run = RUNS[run_id]

    if run is None:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown run: {run_id}",
        )

    return run


def validate_parameters(
    model: ModelInfo, provided_parameters: dict[str, int]
) -> dict[str, int]:
    expected_parameters = {param.name: param for param in model.parameters}

    unexpected_parameters = set(provided_parameters) - set(expected_parameters)

    if unexpected_parameters:
        raise HTTPException(
            status_code=400,
            detail=f"Unexpected parameters: {sorted(unexpected_parameters)}",
        )

    missing_parameters = set(expected_parameters) - set(provided_parameters)

    if missing_parameters:
        raise HTTPException(
            status_code=400,
            detail=f"Missing parameters: {sorted(missing_parameters)}",
        )

    for name, value in provided_parameters.items():
        param = expected_parameters[name]
        if value < param.minimum or value > param.maximum:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Parameter '{name}' value must be between "
                    f"{param.minimum} and {param.maximum}."
                ),
            )

    return provided_parameters

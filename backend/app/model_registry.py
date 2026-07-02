from app.schemas import ModelInfo, ModelParameter

MODEL_REGISTRY: list[ModelInfo] = [
    ModelInfo(
        id="game-of-life",
        name="Game of Life",
        description=(
            "A cellular automaton on a 2D grid representing Conway's Game of Life."
        ),
        parameters=[
            ModelParameter(
                name="width",
                type="integer",
                default=50,
                minimum=5,
                maximum=200,
            ),
            ModelParameter(
                name="height",
                type="integer",
                default=50,
                minimum=5,
                maximum=200,
            ),
            ModelParameter(
                name="steps",
                type="integer",
                default=100,
                minimum=1,
                maximum=1000,
            ),
        ],
    )
]


def list_models() -> list[ModelInfo]:
    """
    Returns a list of all available models in the registry.
    """
    return MODEL_REGISTRY


def get_model(model_id) -> ModelInfo | None:
    for model in MODEL_REGISTRY:
        if model.id == model_id:
            return model

    return None

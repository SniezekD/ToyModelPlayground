from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_models_returns_game_of_life() -> None:
    response = client.get("/models")

    assert response.status_code == 200

    models = response.json()

    assert len(models) == 1
    assert models[0]["id"] == "game-of-life"
    assert models[0]["name"] == "Game of Life"
    assert (
        models[0]["description"]
        == "A cellular automaton on a 2D grid representing Conway's Game of Life."
    )
    assert models[0]["parameters"] == [
        {
            "name": "width",
            "type": "integer",
            "default": 50,
            "minimum": 5,
            "maximum": 200,
        },
        {
            "name": "height",
            "type": "integer",
            "default": 50,
            "minimum": 5,
            "maximum": 200,
        },
        {
            "name": "steps",
            "type": "integer",
            "default": 100,
            "minimum": 1,
            "maximum": 1000,
        },
    ]

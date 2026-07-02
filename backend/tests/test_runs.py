from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_run_for_game_of_life() -> None:
    response = client.post(
        "/runs",
        json={
            "model_id": "game-of-life",
            "parameters": {
                "height": 30,
                "width": 30,
                "steps": 50,
            },
        },
    )

    assert response.status_code == 200

    run = response.json()
    assert isinstance(run["id"], str)
    assert run["model_id"] == "game-of-life"
    assert run["status"] == "created"
    assert run["parameters"] == {
        "height": 30,
        "width": 30,
        "steps": 50,
    }


def test_created_run_can_be_retvived() -> None:
    create_response = client.post(
        "/runs",
        json={
            "model_id": "game-of-life",
            "parameters": {
                "height": 30,
                "width": 30,
                "steps": 50,
            },
        },
    )

    run_id = create_response.json()["id"]

    get_response = client.get(f"/runs/{run_id}")

    assert get_response.status_code == 200
    assert get_response.json()["id"] == run_id


def test_create_run_rejects_unknown_model() -> None:
    response = client.post(
        "/runs",
        json={
            "model_id": "unknown-model",
            "parameters": {
                "width": 30,
                "height": 30,
                "steps": 50,
            },
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Unknown model: unknown-model"}


def test_create_run_rejects_missing_parameter() -> None:
    response = client.post(
        "/runs",
        json={
            "model_id": "game-of-life",
            "parameters": {
                "width": 30,
                "height": 30,
            },
        },
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Missing parameters: ['steps']"}


def test_create_run_rejects_out_of_range_parameter() -> None:
    response = client.post(
        "/runs",
        json={
            "model_id": "game-of-life",
            "parameters": {"width": 30, "height": 300, "steps": 500},
        },
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "Parameter 'height' value must be between 5 and 200."
    }

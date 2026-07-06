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
    assert run["status"] == "completed"
    assert run["parameters"] == {
        "height": 30,
        "width": 30,
        "steps": 50,
    }

    result = run["result"]

    assert result["summary"] == (
        "Game Of Life completed for a 30x30 grid over 50 "
        "steps with 3 living cells remaining."
    )
    assert result["grid_width"] == 30
    assert result["grid_height"] == 30
    assert result["steps_completed"] == 50
    assert result["alive_cells"] == 3
    assert len(result["final_grid"]) == 30
    assert len(result["final_grid"][0]) == 30


def test_created_run_can_be_retvieved() -> None:
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
    assert get_response.json()["status"] == "completed"


def test_get_run_rejects_unknown_run() -> None:
    response = client.get("/runs/unknown-run")

    assert response.status_code == 404
    assert response.json() == {"detail": "Unknown run: unknown-run"}


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

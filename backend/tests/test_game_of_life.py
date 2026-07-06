from app.game_of_life import (
    compute_next_grid,
    count_alive_cells,
    create_initial_grid,
    run_game_of_life,
)


def test_intitial_grid_contains_centered_blinker() -> None:
    grid = create_initial_grid(width=5, height=5)

    assert grid == [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ]


def test_blinker_rotates_after_one_step() -> None:
    grid = create_initial_grid(width=5, height=5)

    next_grid = compute_next_grid(grid)

    assert next_grid == [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
    ]


def test_blinker_returns_to_initial_state_after_two_steps() -> None:
    initial_grid = create_initial_grid(width=5, height=5)

    final_grid = run_game_of_life(width=5, height=5, steps=2)

    assert final_grid == initial_grid


def test_alive_cell_count() -> None:
    grid = create_initial_grid(width=5, height=5)
    assert count_alive_cells(grid) == 3

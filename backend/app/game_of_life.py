Grid = list[list[int]]


def create_initial_grid(width: int, height: int) -> Grid:
    grid = [[0 for _ in range(width)] for _ in range(height)]

    center_row = height // 2
    center_column = width // 2

    grid[center_row][center_column - 1] = 1
    grid[center_row][center_column] = 1
    grid[center_row][center_column + 1] = 1

    return grid


def count_alive_neighbors(grid: Grid, row: int, column: int) -> int:
    height = len(grid)
    width = len(grid[0])
    alive_neighbors = 0

    for row_offset in (-1, 0, 1):
        for column_offset in (-1, 0, 1):
            if row_offset == column_offset == 0:
                continue
            neighbor_row = row + row_offset
            neighbor_column = column + column_offset

            if neighbor_row < 0 or neighbor_row >= height:
                continue

            if neighbor_column < 0 or neighbor_column >= width:
                continue

            alive_neighbors += grid[neighbor_row][neighbor_column]

    return alive_neighbors


def compute_next_grid(grid: Grid) -> Grid:
    height = len(grid)
    width = len(grid[0])
    next_grid = [[0 for _ in range(width)] for _ in range(height)]

    for row_i in range(height):
        for col_i in range(width):
            alive_neighbors = count_alive_neighbors(grid, row_i, col_i)
            cell_is_alive = grid[row_i][col_i] == 1

            if cell_is_alive and alive_neighbors in (2, 3):
                next_grid[row_i][col_i] = 1
            elif not cell_is_alive and alive_neighbors == 3:
                next_grid[row_i][col_i] = 1
            # Do not have to set cell to dead otherwise, because the grid is
            # initialized as dead

    return next_grid


def run_game_of_life(width: int, height: int, steps: int) -> Grid:
    grid = create_initial_grid(width=width, height=height)

    for _ in range(steps):
        grid = compute_next_grid(grid)

    return grid


def count_alive_cells(grid: Grid) -> int:
    return sum(sum(row) for row in grid)

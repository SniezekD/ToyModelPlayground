# Toy Model Playground

Toy Model Playground is a learning project for building a full-stack web application that can run toy scientific models.

The long-term goal is to provide a browser-based interface where users can configure and run models such as Game of Life, pendulums, cellular automata, and other small simulations.

Each model should eventually run in an isolated environment, such as a Docker container.

## Planned architecture

- Frontend: React + TypeScript
- Backend: Python + FastAPI
- Model execution: Docker-based isolated model containers
- Local orchestration: Docker Compose
- Database: PostgreSQL, added later when run history is needed
# Chess-online

Online chess platform written with Deno & React

<p align="middle">
  <img src="https://raw.githubusercontent.com/denolib/high-res-deno-logo/master/deno_hr_circle.svg" width="100" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" width="100" />
</p>

## Preview


Mobile                     |  Desktop
:-------------------------:|:-------------------------:
![Mobile](docs/mobile.png) | ![Desktop](docs/game.png)

Lobby                     |  New game
:-------------------------:|:-------------------------:
![Lobby](docs/lobby.png) | ![Desktop](docs/newgame.png)

## Requirements

- Docker

## Installation

```bash
git clone git@github.com:akcyp/chess-online.git
cd chess-online
docker-compose build
docker-compose up
```

## Development

You may need:
- Deno v1.29.1 (backend)
- Node v19.2.0 (frontend)
- pnpm v7.19.0 (frontend, `corepack enable`)

```bash
# Run frontend development server
cd frontend
pnpm install
pnpm run dev
cd ..
# Run backend development server
cd backend
deno cache main.ts
deno task dev
cd ..
```

# Chess-online

Online chess platform written with Python & React

<p align="middle">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Python_logo_01.svg/800px-Python_logo_01.svg.png" width="100" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png" width="100" />
</p>

## Preview


Mobile                          |  Desktop
:------------------------------:|:-------------------------:
![Mobile](images/mobile.png)    | ![Desktop](images/game.png)

New game                        |  Lobby
:------------------------------:|:-------------------------:
![New game](images/newgame.png) | ![Lobby](images/lobby.png)

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
- Python3 v3.10.8 (backend)
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
pip install -r -requirements.txt
python3 app.py
cd ..
```

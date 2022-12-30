from typing import Dict
import uuid
import os
import ssl
from sanic import Blueprint, Sanic, Request, Websocket, empty, json
from sanic_session import Session, InMemorySessionInterface
from sanic.exceptions import Unauthorized, NotFound
from sanic.log import logger
from ws_core.ws_user import WS_User
from core.lobby import LobbyRoom

from utils.username_generator import generate_username

app = Sanic(name='ChessServer')
store = InMemorySessionInterface(
    cookie_name='pfsession',
    secure=True,
    samesite='None'
)
Session(app, interface=store)

base_url = os.environ.get('BASE_URL') or 'https://localhost:4000'
lobby = LobbyRoom()

# Session regenerate


async def session_middleware(request: Request):
    if not request.ctx.session.get('userUUID'):
        request.ctx.session['userUUID'] = str(uuid.uuid1())
    if not request.ctx.session.get('username'):
        request.ctx.session['username'] = generate_username()


def get_session_data(request: Request) -> Dict[str, str]:
    if 'userUUID' not in request.ctx.session:
        return None
    if 'username' not in request.ctx.session:
        return None
    return {
        'userUUID': request.ctx.session['userUUID'],
        'username': request.ctx.session['username'],
    }

# API Lobby Endpoint


@app.route('/api/lobby')
async def endpointLobby(request: Request):
    await session_middleware(request)
    sess_data = get_session_data(request)
    if sess_data is None:
        return empty(status=404)

    response = json({
        'username': sess_data.get('username'),
    })
    response.headers.add('Access-Control-Allow-Origin', base_url)
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', '*')
    return response

# API Game Endpoint


@app.route('/api/game/<room_id>')
async def endpointGame(request: Request, room_id: str):
    await session_middleware(request)
    sess_data = get_session_data(request)
    if sess_data is None:
        return empty(status=404)

    room = lobby.get_room(room_id)
    if room is None:
        return empty(status=404)

    preview = room.get_preview()

    response = json({
        'auth': {
            'username': sess_data.get('username'),
        },
        **preview,
    })
    response.headers.add('Access-Control-Allow-Origin', base_url)
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', '*')
    return response


# WS Lobby Handler
@app.websocket('/ws/lobby')
async def lobbyWSHandler(request: Request, ws: Websocket):
    sess_data = get_session_data(request)
    if sess_data is None:
        raise Unauthorized("No session")

    user = WS_User(
        ws=ws,
        userUUID=sess_data.get('userUUID'),
        username=sess_data.get('username'),
    )

    logger.info('User {} joined the lobby'.format(user.username))
    lobby.add_user(user)
    try:
        async for msg in ws:
            logger.info('User {} sent message to lobby: {}'.format(
                user.username, msg))
            lobby.on_message(user, msg)
    finally:
        lobby.remove_user(user)
        logger.info('User {} left the lobby'.format(user.username))


# WS Game Handler
bp = Blueprint("WSGame")


@bp.on_request
async def on_request(request: Request):
    room_id = request.match_info.get('room_id')
    if lobby.get_room(room_id) is None:
        raise NotFound()


@bp.websocket('/ws/game/<room_id>')
async def gameWSHandler(request: Request, ws: Websocket, room_id: str):
    sess_data = get_session_data(request)
    if sess_data is None:
        raise Unauthorized("No session")

    room = lobby.get_room(room_id)
    if room is None:
        raise NotFound()

    user = WS_User(
        ws=ws,
        userUUID=sess_data.get('userUUID'),
        username=sess_data.get('username'),
    )

    logger.info('User {} joined the game {}'.format(user.username, room_id))
    room.add_user(user)
    try:
        async for msg in ws:
            logger.info('User {} sent message to {}: {}'.format(
                user.username, room_id, msg))
            room.on_message(user, msg)
    finally:
        room.remove_user(user)
        logger.info('User {} left the game {}'.format(user.username, room_id))


app.blueprint(bp)

# ...

if __name__ == '__main__':
    is_prod = os.environ.get('MODE') == 'PRODUCTION'
    is_dev = not is_prod
    ssl = {
        'cert': '/certs/cert.pem' if is_prod else '../certificates/cert.pem',
        'key': '/certs/key.pem' if is_prod else '../certificates/key.pem',
    }
    app.run(
        host='localhost' if is_dev else '0.0.0.0',
        port=3000,
        ssl=ssl,
        auto_reload=is_dev,
        debug=is_dev
    )

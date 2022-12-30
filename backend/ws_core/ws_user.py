import json
from sanic import Websocket


class WS_User:
    def __init__(self, ws: Websocket, userUUID: str, username: str):
        self.ws = ws
        self.userUUID = userUUID
        self.username = username

    async def send(self, msg: str):
        json_data = json.dumps(msg)
        try:
            await self.ws.send(json_data)
        except Exception as e:
            print('Failed to send data to client: {}', e)

    def __repr__(self):
        return f"WS_User({self.userUUID}, {self.username})"

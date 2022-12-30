import json
from sanic import Websocket


class WS_User:
    def __init__(self, ws: Websocket, userUUID: str, username: str):
        self.ws = ws
        self.userUUID = userUUID
        self.username = username

    async def send_json(self, data: dict):
        json_data = json.dumps(data)
        await self.ws.send(json_data)

    async def send(self, msg: str):
        await self.ws.send(msg)

    def __repr__(self):
        return f"WS_User({self.userUUID}, {self.username})"

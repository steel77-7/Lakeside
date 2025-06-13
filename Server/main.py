from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

app = FastAPI()

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, socket: WebSocket, room_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(socket)

    async def broadcast(self, room_id: str, message: str):
        room = self.rooms.get(room_id, [])
        for socket in room:
            await socket.send_text(message)

    async def handle_message(self, message: dict, room_id: str):
        message_type = message.get('type')
        msg = json.dumps(message)

        if message_type in ['offer', 'answer', 'sdp']:
            await self.broadcast(room_id, msg)
        elif message_type == 'leave-room':
            await self.leave_room(room_id, message.get('socket'))

    async def leave_room(self, room_id: str, leaving_socket: WebSocket):
        if room_id in self.rooms:
            if leaving_socket in self.rooms[room_id]:
                self.rooms[room_id].remove(leaving_socket)
            if len(self.rooms[room_id]) == 0:
                del self.rooms[room_id]



manager = RoomManager()



@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            res = await websocket.receive_text()
            if not res:
                continue
            res_json = json.loads(res)
            room_id = res_json.get("room_id")
            await manager.connect(websocket, room_id)
            await manager.handle_message(res_json, room_id)
            
    except WebSocketDisconnect:
        print("Client disconnected")

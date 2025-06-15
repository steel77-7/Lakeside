from fastapi import WebSocket
from typing import Dict, List
import json

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, socket: WebSocket, room_id: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(socket)

    # async def broadcast(self, room_id: str, message: str):
    #     room = self.rooms.get(room_id, [])
    #     for socket in room:
    #         print(message)
    #         await socket.send_text(message)

    async def broadcast(self, room_id: str, message: str):
        to_remove = []
        for socket in self.rooms.get(room_id, []):
            try:
                await socket.send_text(message)
            except RuntimeError as e:
                print(f"Failed to send message: {e}")
                to_remove.append(socket)

        for socket in to_remove:
            self.rooms[room_id].remove(socket)


    async def handle_message(self, message: dict, room_id: str, sender_socket: WebSocket):
        message_type = message.get('type')
        msg = json.dumps(message)
        if message_type in ['offer', 'answer', 'sdp','create-room','join-room']:
            await self.broadcast(room_id, msg)
        elif message_type == 'leave-room':
            await self.leave_room(room_id, sender_socket)

    async def leave_room(self, room_id: str, leaving_socket: WebSocket):
        if room_id in self.rooms:
            if leaving_socket in self.rooms[room_id]:
                self.rooms[room_id].remove(leaving_socket)
            if len(self.rooms[room_id]) == 0:
                del self.rooms[room_id]

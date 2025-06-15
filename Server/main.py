from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import json
from core.room_manager import RoomManager
from fastapi.middleware.cors import CORSMiddleware
import os
from routes.user_routes import router as user_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = RoomManager()

@app.get("/health-check")
async def root():
    return {"message": "Server is healthy"}

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
            await manager.handle_message(res_json, room_id,websocket)
    except WebSocketDisconnect:
        print("Client disconnected")

app.include_router(user_router, prefix="/api/user")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=6969, reload=True)

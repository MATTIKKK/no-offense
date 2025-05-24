from fastapi import WebSocket, WebSocketDisconnect
from collections import defaultdict

active_connections = defaultdict(list)

async def websocket_endpoint(websocket: WebSocket, chat_id: int):
    await websocket.accept()
    active_connections[chat_id].append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for connection in active_connections[chat_id]:
                if connection != websocket:
                    await connection.send_text(data)
    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)
from fastapi import WebSocket, WebSocketDisconnect, Depends
from collections import defaultdict
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Message
from datetime import datetime
from contextlib import contextmanager

active_connections = defaultdict(list)


@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def websocket_endpoint(websocket: WebSocket, chat_id: int):
    await websocket.accept()
    active_connections[chat_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            with get_db() as db:
                message = Message(
                    sender_id=data["sender_id"],
                    chat_id=chat_id,
                    content=data["content"],
                    timestamp=datetime.utcnow(),
                    is_ai_modified=data.get("is_ai_modified", False),
                    original_content=data.get("original_content"),
                )
                db.add(message)
                db.commit()
                db.refresh(message)

                print("💾 Saved message:", message.id, message.sender_id, message.content)


            data["id"] = message.id
            data["timestamp"] = message.timestamp.isoformat()

            for connection in active_connections[chat_id]:
                await connection.send_json(data)

    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)

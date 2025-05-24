from fastapi import WebSocket, WebSocketDisconnect, Depends
from collections import defaultdict
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Message
from datetime import datetime

active_connections = defaultdict(list)

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

            # ✅ Сохраняем сообщение в базу данных
            db: Session = next(get_db())
            message = Message(
                sender_id=data["sender_id"],
                chat_id=chat_id,
                content=data["content"],
                timestamp=datetime.utcnow(),
                is_ai_modified=data.get("is_ai_modified", False),
                original_content=data.get("original_content")
            )
            db.add(message)
            db.commit()

            # ✅ Добавляем ID из базы (нужно для ключей в React)
            db.refresh(message)
            data["id"] = message.id
            data["timestamp"] = message.timestamp.isoformat()

            # ✅ Рассылаем остальным участникам
            for connection in active_connections[chat_id]:
                await connection.send_json(data)

    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)

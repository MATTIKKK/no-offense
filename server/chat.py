from fastapi import APIRouter, Depends, HTTPException,WebSocket, WebSocketDisconnect, APIRouter, Depends

from sqlalchemy.orm import Session
from collections import defaultdict
from sqlalchemy import or_, and_
from database import SessionLocal
from models import Chat, Invite, Message, User
from schemas import InviteResponse, InviteCreate, MessageIn, ChatOut, UserPublic
from datetime import datetime
import json

active_connections = defaultdict(list)
router = APIRouter(prefix="/chat", tags=["Chat"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/invite")
def send_invite(invite: InviteCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter_by(id=invite.to_user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    existing_invite = db.query(Invite).filter_by(
        from_user_id=invite.from_user_id,
        to_user_id=invite.to_user_id,
        status="pending"
    ).first()

    if existing_invite:
        raise HTTPException(status_code=400, detail="Invite already sent")

    new_invite = Invite(
        from_user_id=invite.from_user_id,
        to_user_id=invite.to_user_id,
        relationship_type=invite.relationship_type,
        label_for_partner=invite.label_for_partner,
        status="pending"
    )
    db.add(new_invite)
    db.commit()
    return {"status": "sent"}


@router.get("/invites/{user_id}")
def get_user_invites(user_id: str, db: Session = Depends(get_db)):
    invites = db.query(Invite).filter_by(to_user_id=user_id, status="pending").all()
    result = []
    for invite in invites:
        from_user = db.query(User).filter_by(id=invite.from_user_id).first()
        result.append({
            "id": invite.id,
            "from_user_id": invite.from_user_id,
            "from_user_name": from_user.name if from_user else "Unknown",
            "to_user_id": invite.to_user_id,
            "relationship_type": invite.relationship_type,
            "status": invite.status
        })
    return result


@router.post("/respond")
def respond_invite(payload: InviteResponse, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter_by(id=payload.invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    chat_id = None

    if payload.accept:
        existing_chat = db.query(Chat).filter(
            or_(
                and_(Chat.user1_id == invite.from_user_id, Chat.user2_id == invite.to_user_id),
                and_(Chat.user1_id == invite.to_user_id, Chat.user2_id == invite.from_user_id)
            )
        ).first()

        if existing_chat:
            chat_id = existing_chat.id
        else:
            chat = Chat(
                user1_id=invite.from_user_id,
                user2_id=invite.to_user_id,
                created_at=datetime.utcnow()
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)
            chat_id = chat.id

    db.delete(invite)
    db.commit()

    return {"status": "accepted" if payload.accept else "rejected", "chat_id": chat_id}


@router.post("/message")
def send_message(msg: MessageIn, db: Session = Depends(get_db)):
    is_conflict = msg.topic is not None
    message = Message(**msg.dict(), is_conflict=is_conflict)
    db.add(message)
    db.commit()

    if is_conflict:
        similar_count = db.query(Message).filter_by(chat_id=msg.chat_id, topic=msg.topic).count()
        if similar_count >= 3:
            return {
                "status": "sent",
                "alert": f"The topic '{msg.topic}' has been discussed {similar_count} times. Consider resolving it."
            }

    return {"status": "sent"}


@router.get("/chats/{user_id}")
def get_user_chats(user_id: str, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(
        or_(Chat.user1_id == user_id, Chat.user2_id == user_id)
    ).all()

    result = []
    for chat in chats:
        user1 = db.query(User).filter_by(id=chat.user1_id).first()
        user2 = db.query(User).filter_by(id=chat.user2_id).first()
        last_message = (
            db.query(Message)
            .filter_by(chat_id=chat.id)
            .order_by(Message.timestamp.desc())
            .first()
        )

        result.append({
            "id": chat.id,
            "created_at": chat.created_at,
            "user1": {"id": user1.id, "name": user1.name} if user1 else {"id": "?", "name": "Unknown"},
            "user2": {"id": user2.id, "name": user2.name} if user2 else {"id": "?", "name": "Unknown"},
            "last_message": {
                "content": last_message.content,
                "timestamp": last_message.timestamp.isoformat(),
            } if last_message else None
        })
    return result



@router.get("/chats/{user_id}/chat/{chat_id}")
def get_user_chat_by_id(user_id: str, chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        or_(
            Chat.user1_id == user_id,
            Chat.user2_id == user_id
        )
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or access denied")

    user1 = db.query(User).filter_by(id=chat.user1_id).first()
    user2 = db.query(User).filter_by(id=chat.user2_id).first()

    messages = db.query(Message).filter_by(chat_id=chat.id).order_by(Message.timestamp).all()

    return {
        "id": chat.id,
        "created_at": chat.created_at,
        "user1": {"id": user1.id, "name": user1.name} if user1 else {"id": "?", "name": "Unknown"},
        "user2": {"id": user2.id, "name": user2.name} if user2 else {"id": "?", "name": "Unknown"},
        "conflict_status": chat.status if hasattr(chat, "status") else "resolved",  # если есть
        "messages": [
            {
                "id": m.id,
                "chat_id": m.chat_id,
                "sender_id": m.sender_id,
                "content": m.content,
                "timestamp": m.timestamp.isoformat(),
                "is_ai_modified": m.is_ai_modified,
                "original_content": m.original_content,
            }
            for m in messages
        ]
    }

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        or_(
            Chat.user1_id == user_id,
            Chat.user2_id == user_id
        )
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found or access denied")

    user1 = db.query(User).filter_by(id=chat.user1_id).first()
    user2 = db.query(User).filter_by(id=chat.user2_id).first()

    return ChatOut(
        id=chat.id,
        created_at=chat.created_at,
        user1=UserPublic(id=user1.id, name=user1.name) if user1 else UserPublic(id="?", name="Unknown"),
        user2=UserPublic(id=user2.id, name=user2.name) if user2 else UserPublic(id="?", name="Unknown"),
    )

@router.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    active_connections[chat_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            data_dict = json.loads(data)

            # Сохраняем сообщение в БД
            msg = Message(
                chat_id=chat_id,
                sender_id=data_dict["sender_id"],
                content=data_dict["content"],
                timestamp=datetime.utcnow()
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            # Рассылаем всем в чате
            for connection in active_connections[chat_id]:
                await connection.send_text(json.dumps({
                    "id": msg.id,
                    "chat_id": chat_id,
                    "sender_id": msg.sender_id,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                }))
    except WebSocketDisconnect:
        active_connections[chat_id].remove(websocket)
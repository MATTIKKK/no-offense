from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Chat, Invite, Message, User
from schemas import InviteResponse
from schemas import InviteCreate, MessageIn
from sqlalchemy import or_
from schemas import ChatOut
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["Chat"])

# Dependency для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 📩 Отправить инвайт пользователю
@router.post("/invite")
def send_invite(invite: InviteCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter_by(id=invite.to_user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

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
    return invites


@router.post("/respond")
def respond_invite(payload: InviteResponse, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter_by(id=payload.invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    invite.status = "accepted" if payload.accept else "rejected"

    if payload.accept:
        existing_chat = db.query(Chat).filter(
            or_(
                (Chat.user1_id == invite.from_user_id) & (Chat.user2_id == invite.to_user_id),
                (Chat.user1_id == invite.to_user_id) & (Chat.user2_id == invite.from_user_id)
            )
        ).first()

        if not existing_chat:
            chat = Chat(user1_id=invite.from_user_id, user2_id=invite.to_user_id)
            db.add(chat)
            db.commit()
            db.refresh(chat)
            return {"status": "accepted", "chat_id": chat.id}
        else:
            return {"status": "accepted", "chat_id": existing_chat.id}

    db.commit()
    return {"status": "rejected"}


# 💬 Отправить сообщение
@router.post("/message")
def send_message(msg: MessageIn, db: Session = Depends(get_db)):
    is_conflict = msg.topic is not None
    message = Message(**msg.dict(), is_conflict=is_conflict)
    db.add(message)
    db.commit()

    # Если это конфликтная тема — проверить на повторяемость
    if is_conflict:
        similar_count = db.query(Message).filter_by(chat_id=msg.chat_id, topic=msg.topic).count()
        if similar_count >= 3:
            return {
                "status": "sent",
                "alert": f"The topic '{msg.topic}' has been discussed {similar_count} times. Consider resolving it."
            }

    return {"status": "sent"}


@router.get("/chats/{user_id}", response_model=list[ChatOut])
def get_user_chats(user_id: str, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(
        or_(Chat.user1_id == user_id, Chat.user2_id == user_id)
    ).all()

    if not chats:
        return []

    return chats
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from database import SessionLocal
from models import Chat, Invite, Message, User
from schemas import InviteResponse, InviteCreate, MessageIn, ChatOut, UserPublic
from datetime import datetime

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


@router.get("/chats/{user_id}", response_model=list[ChatOut])
def get_user_chats(user_id: str, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(
        or_(Chat.user1_id == user_id, Chat.user2_id == user_id)
    ).all()

    result = []
    for chat in chats:
        user1 = db.query(User).filter_by(id=chat.user1_id).first()
        user2 = db.query(User).filter_by(id=chat.user2_id).first()
        result.append(ChatOut(
            id=chat.id,
            created_at=chat.created_at,
            user1=UserPublic(id=user1.id, name=user1.name) if user1 else UserPublic(id="?", name="Unknown"),
            user2=UserPublic(id=user2.id, name=user2.name) if user2 else UserPublic(id="?", name="Unknown"),
        ))
    return result


@router.get("/chats/{user_id}/chat/{chat_id}", response_model=ChatOut)
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

    return ChatOut(
        id=chat.id,
        created_at=chat.created_at,
        user1=UserPublic(id=user1.id, name=user1.name) if user1 else UserPublic(id="?", name="Unknown"),
        user2=UserPublic(id=user2.id, name=user2.name) if user2 else UserPublic(id="?", name="Unknown"),
    )

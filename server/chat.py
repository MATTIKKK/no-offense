from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Chat, Invite, Message, User
from schemas import InviteCreate, MessageIn

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/invite")
def send_invite(invite: InviteCreate, from_user_id: str, db: Session = Depends(get_db)):
    if not db.query(User).filter_by(id=invite.to_user_id).first():
        raise HTTPException(status_code=404, detail="User not found")
    new_invite = Invite(from_user_id=from_user_id, to_user_id=invite.to_user_id,
                        relationship=invite.relationship, status="pending")
    db.add(new_invite)
    db.commit()
    return {"status": "sent"}

@router.post("/respond")
def respond_invite(invite_id: int, accept: bool, db: Session = Depends(get_db)):
    inv = db.query(Invite).filter_by(id=invite_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invite not found")
    inv.status = "accepted" if accept else "rejected"
    if accept:
        new_chat = Chat(user1_id=inv.from_user_id, user2_id=inv.to_user_id)
        db.add(new_chat)
    db.commit()
    return {"status": inv.status}

@router.post("/message")
def send_message(msg: MessageIn, db: Session = Depends(get_db)):
    m = Message(**msg.dict(), is_conflict=(msg.topic is not None))
    db.add(m)
    db.commit()
    if msg.topic:
        similar = db.query(Message).filter_by(chat_id=msg.chat_id, topic=msg.topic).count()
        if similar >= 3:
            return {"alert": f"This topic '{msg.topic}' has come up multiple times."}
    return {"status": "sent"}
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatOut(BaseModel):
    id: int
    user1_id: str
    user2_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class InviteCreate(BaseModel):
    from_user_id: str
    to_user_id: str
    relationship_type: str
    label_for_partner: str

class MessageIn(BaseModel):
    chat_id: int
    content: str
    sender_id: str
    topic: Optional[str] = None

class InviteResponse(BaseModel):
    invite_id: int
    accept: bool
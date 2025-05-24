from pydantic import BaseModel
from typing import Optional

class UserRegister(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class InviteCreate(BaseModel):
    to_user_id: str
    relationship: str

class MessageIn(BaseModel):
    chat_id: int
    content: str
    sender_id: str
    topic: Optional[str] = None
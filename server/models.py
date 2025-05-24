from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(6), primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)

class Invite(Base):
    __tablename__ = "invites"
    id = Column(Integer, primary_key=True)
    from_user_id = Column(String, ForeignKey("users.id"))
    to_user_id = Column(String, ForeignKey("users.id"))
    relationship = Column(String)
    status = Column(String)

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True)
    user1_id = Column(String, ForeignKey("users.id"))
    user2_id = Column(String, ForeignKey("users.id"))

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    sender_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    topic = Column(String, nullable=True)
    is_conflict = Column(Boolean, default=False)

class Specialist(Base):
    __tablename__ = "specialists"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    city = Column(String)
    photo_url = Column(String)
    specialization = Column(String)
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(6), primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)

    sent_invites = relationship(
        "Invite", foreign_keys="[Invite.from_user_id]", back_populates="from_user"
    )
    received_invites = relationship(
        "Invite", foreign_keys="[Invite.to_user_id]", back_populates="to_user"
    )

    sent_messages = relationship("Message", back_populates="sender")


class Invite(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    relationship_type = Column(String, nullable=False)
    label_for_partner = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")

    from_user = relationship("User", foreign_keys=[from_user_id], back_populates="sent_invites")
    to_user = relationship("User", foreign_keys=[to_user_id], back_populates="received_invites")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(String, ForeignKey("users.id"), nullable=False)
    user2_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    topic = Column(String, nullable=True)
    is_conflict = Column(Boolean, default=False)

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")


class Specialist(Base):
    __tablename__ = "specialists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    specialization = Column(String, nullable=False)

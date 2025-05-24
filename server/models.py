from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(6), primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)

    # Invites
    sent_invites = relationship("Invite", foreign_keys="[Invite.from_user_id]", back_populates="from_user")
    received_invites = relationship("Invite", foreign_keys="[Invite.to_user_id]", back_populates="to_user")

    # Messages
    sent_messages = relationship("Message", back_populates="sender")

class Invite(Base):
    __tablename__ = "invites"
    id = Column(Integer, primary_key=True)
    from_user_id = Column(String, ForeignKey("users.id"))
    to_user_id = Column(String, ForeignKey("users.id"))
    relationship_type = Column(String)
    label_for_partner = Column(String)
    status = Column(String)

    from_user = relationship("User", foreign_keys=[from_user_id], back_populates="sent_invites")
    to_user = relationship("User", foreign_keys=[to_user_id], back_populates="received_invites")


class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True)
    user1_id = Column(String, ForeignKey("users.id"))
    user2_id = Column(String, ForeignKey("users.id"))

    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    sender_id = Column(String, ForeignKey("users.id"))
    content = Column(Text)
    topic = Column(String, nullable=True)
    is_conflict = Column(Boolean, default=False)

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", back_populates="sent_messages")

class Specialist(Base):
    __tablename__ = "specialists"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    specialization = Column(String, nullable=False)

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from database import Base, engine
from auth import router as auth_router
from chat import router as chat_router
from specialists import router as specialists_router
from websocket import websocket_endpoint

from rephrase import router as ai_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.websocket("/ws/chat/{chat_id}")(websocket_endpoint)   
app.include_router(ai_router)
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(specialists_router)

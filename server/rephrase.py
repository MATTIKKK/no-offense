from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests

load_dotenv()
router = APIRouter(prefix="/ai", tags=["AI"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct" 
class RephraseRequest(BaseModel):
    message: str

@router.post("/rephrase")
async def rephrase_message(req: RephraseRequest):
    try:
        if not GROQ_API_KEY:
            raise Exception("GROQ_API_KEY not found")

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "Ты профессиональный дипломат, который делает речь вежливее и доброжелательнее. Переформулируй сообщение так, чтобы сообщение звучало более конструктивно, но сохранило смысл и стиль неформального общения. Сообщение должно быть построено для второго лица единственного числа. И на идеально русском языке, коротко"
                },
                {
                    "role": "user",
                    "content": req.message
                }
            ]
        }

        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        print("[DEBUG]", response.status_code, response.text)
        response.raise_for_status()

        data = response.json()
        rewritten = data["choices"][0]["message"]["content"].strip()
        return {"rephrased": rewritten}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Groq AI rephrasing failed")

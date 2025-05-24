from fastapi import APIRouter, HTTPException, UploadFile, File
import whisper
import tempfile
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests

whisper_model = whisper.load_model("base") 

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
                    "content": "Ты опытный дипломат и коммуникатор. Переформулируй входящее сообщение так, чтобы оно звучало вежливо, доброжелательно и конструктивно, при этом точно передавало основную мысль. Стиль — неформальный, обращение на 'ты', язык — идеальный русский. Если исходное сообщение содержит чрезмерное количество нецензурных выражений или оскорблений, не переписывай его — просто ответь: 'Предлагаю вернуться к этому разговору чуть позже, когда мы оба успокоимся.",
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


@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        result = whisper_model.transcribe(tmp_path, language="ru")
        return {"text": result["text"].strip()}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Whisper STT failed")
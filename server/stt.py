import speech_recognition as sr
import tempfile
from fastapi import APIRouter, UploadFile, File

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/stt")
async def stt_google(file: UploadFile = File(...)):
    recognizer = sr.Recognizer()
    audio_bytes = await file.read()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        temp_file.write(audio_bytes)
        temp_path = temp_file.name

    with sr.AudioFile(temp_path) as source:
        audio_data = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio_data, language="ru-RU")
        return {"text": text}
    except sr.UnknownValueError:
        return {"text": ""}
    except sr.RequestError as e:
        return {"text": f"API Error: {e}"}

from fastapi import APIRouter
from models import Specialist
from database import SessionLocal

router = APIRouter(prefix="/specialists", tags=["Specialists"])

@router.get("/")
def list_specialists(specialization: str = None):
    db = SessionLocal()
    query = db.query(Specialist)
    if specialization:
        query = query.filter_by(specialization=specialization)
    return query.all()
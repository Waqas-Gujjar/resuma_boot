# Resume upload aur analysis ka API route
from fastapi import APIRouter, UploadFile, Form, HTTPException
from typing import Optional
from services.resume_ai import extract_text_from_pdf, analyze_resume_with_ai
from models import ResumeAnalysis
from database import SessionLocal

router = APIRouter()

@router.post("/analyze/")
async def analyze_resume(resume: UploadFile, job_description: Optional[str] = Form("")):
    try:
        contents = await resume.read()
        resume_text = extract_text_from_pdf(contents)
        feedback = analyze_resume_with_ai(resume_text, job_description)

        db = SessionLocal()
        analysis = ResumeAnalysis(
            resume_text=resume_text,
            job_description=job_description,
            feedback=feedback
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {"feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

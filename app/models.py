# ResumeAnalysis table yahan define hai
from sqlalchemy import Column, Integer, Text
from .database import Base

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    id = Column(Integer, primary_key=True, index=True)
    resume_text = Column(Text)
    job_description = Column(Text)
    feedback = Column(Text)

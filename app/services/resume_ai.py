# Resume ka text extract aur AI se analysis yahan hota hai
import PyPDF2
import io
import google.generativeai as genai
from ..config import OPENAI_API_KEY

# Gemini API key set kar rahe hain
genai.configure(api_key="AIzaSyCv2_ZyG3Lpa143M4Z-IMajXAOOVEcJEB0")

def extract_text_from_pdf(file_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    return "".join([p.extract_text() for p in reader.pages if p.extract_text()])

def analyze_resume_with_ai(resume_text, job_description):
    # Prompt tayar kar rahe hain AI ke liye
    prompt = f'''
    You are a professional resume reviewer. Analyze the resume text below
    and provide suggestions, missing skills, tone, formatting improvements,
    and a rating out of 10 based on the job description.

    Resume:
    {resume_text}

    Job Description:
    {job_description}
    '''

    # Gemini model ko initialize kar rahe hain
    model = genai.GenerativeModel("gemini-2.5-flash")  # ya "gemini-1.5-pro", depending on access

    # Chat session start karke message bhej rahe hain
    chat = model.start_chat()
    response = chat.send_message(prompt)

    # Response text return kar rahe hain
    return response.text

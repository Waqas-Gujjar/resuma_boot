import PyPDF2
import io
import google.generativeai as genai
from decouple import config

# Load API key
GEMINI_API_KEY = config("OPENAI_API_KEY", default=None)
print("Gemini API Key:", GEMINI_API_KEY)

genai.configure(api_key=GEMINI_API_KEY)

def extract_text_from_pdf(file_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    return "\n".join([p.extract_text() for p in reader.pages if p.extract_text()])

def analyze_resume_with_ai(resume_text, job_description):
    # Initialize the Gemini model and chat session
    model = genai.GenerativeModel("gemini-2.5-flash")
    chat = model.start_chat()

    # Feedback prompt
    feedback_prompt = f"""
    You are a professional resume reviewer and expert in making resumes ATS-friendly.
    Analyze the resume text below and provide:

    1. Suggestions for improvement  
    2. Missing skills or keywords based on the job description  
    3. Tone and formatting improvements  
    4. Rating out of 10  
    5. Whether the resume is ATS-friendly or not

    Resume:
    {resume_text}

    Job Description:
    {job_description}
    """
    feedback_response = chat.send_message(feedback_prompt)

    # Optimized resume prompt
    optimized_resume_prompt = f"""
    Please rewrite the following resume to make it highly optimized and ATS-friendly.
    Keep it professional and relevant to the job description.

    Resume:
    {resume_text}

    Job Description:
    {job_description}
    """
    optimized_response = chat.send_message(optimized_resume_prompt)

    # Cover letter prompt
    cover_letter_prompt = f"""
    Write a job-specific cover letter based on the following resume and job description.

    Resume:
    {resume_text}

    Job Description:
    {job_description}
    """
    cover_letter_response = chat.send_message(cover_letter_prompt)

    # Return all responses
    return {
        "feedback": feedback_response.text,
        "optimized_resume": optimized_response.text,
        "cover_letter": cover_letter_response.text
    }
    
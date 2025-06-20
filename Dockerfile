# Dockerfile

FROM python:3.10-slim

# Workdir set kar rahe hain
WORKDIR /app

# Requirements install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Code copy kar rahe hain
COPY ./app /app

# Uvicorn se app run karna
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

FROM python:3.11-slim

WORKDIR /app

COPY microservices/text-generation/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY microservices/text-generation/text_generation_service.py .

EXPOSE 8001

CMD ["uvicorn", "text_generation_service:app", "--host", "0.0.0.0", "--port", "8001"]
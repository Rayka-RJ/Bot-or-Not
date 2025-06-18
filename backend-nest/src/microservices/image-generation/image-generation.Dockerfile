FROM python:3.11-slim

WORKDIR /app

COPY microservices/image-generation/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY microservices/image-generation/image_generation_service.py .

EXPOSE 8002

CMD ["uvicorn", "image_generation_service:app", "--host", "0.0.0.0", "--port", "8002"]
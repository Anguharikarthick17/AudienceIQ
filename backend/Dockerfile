FROM python:3.12-slim

# Non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Install dependencies first (layer caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/app/ ./app/

# Create directories and populate model artifacts if available
RUN mkdir -p /models /data && chown -R appuser:appuser /models /data /app
COPY models/ /models/
RUN chown -R appuser:appuser /models /data /app

USER appuser

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]

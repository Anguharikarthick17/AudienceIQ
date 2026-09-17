FROM python:3.12-slim

RUN groupadd -r trainer && useradd -r -g trainer trainer

WORKDIR /app

# Install shared backend code (ML modules)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy backend app (for shared ML modules)
COPY backend/app/ ./app/

# Copy trainer script
COPY trainer/train.py ./train.py

# Create dirs
RUN mkdir -p /models /data && chown -R trainer:trainer /models /data /app

USER trainer

CMD ["python", "train.py"]

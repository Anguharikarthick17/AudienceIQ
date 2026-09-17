FROM python:3.12-slim

RUN groupadd -r evaluator && useradd -r -g evaluator evaluator

WORKDIR /app

COPY evaluator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY evaluator/evaluate.py .

RUN mkdir -p /models && chown -R evaluator:evaluator /models /app

USER evaluator

CMD ["python", "evaluate.py"]

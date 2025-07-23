FROM python:3.13-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app


RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-interaction --no-ansi --no-root --only main

COPY . .

RUN mkdir -p /app/uploads &&\
    chown -R 1000:1000 /app/uploads

USER 1000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
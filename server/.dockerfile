# Базовый образ с поддержкой Python + pip
FROM python:3.11-slim

# Устанавливаем system-зависимости (нужны для pydantic, whisper, torch и пр.)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY . .

# Устанавливаем зависимости
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Порт, который будет слушать uvicorn (он должен быть 8000 для Railway)
EXPOSE 8000

# Команда запуска приложения
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

#!/bin/bash

# Запускаем Ollama в фоне
ollama serve &

# Ждем запуска сервера
echo "Waiting for Ollama to start..."
sleep 20

# Создаем модель если файл существует
if [ -f /models/custom_vikhr.Modelfile ]; then
    echo "Creating custom_vikhr model..."
    ollama create vikhr -f /models/custom_vikhr.Modelfile || echo "Model may already exist"
else
    echo "Modelfile not found: /models/custom_vikhr.Modelfile"
    ls -la /models/
fi

# Бесконечное ожидание
tail -f /dev/null
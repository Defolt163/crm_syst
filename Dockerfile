# 1. Используем Node.js образ
FROM node:20-alpine

# 2. Рабочая директория
WORKDIR /app

# 3. Установка зависимостей
COPY package*.json ./
RUN npm install

# 4. Копируем код
COPY . .

# Строим Next.js проект
RUN npm run build

# Экспонируем порт приложения
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]

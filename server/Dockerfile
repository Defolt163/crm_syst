FROM node:20-alpine

WORKDIR /server

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
// server.js
const crypto = require('crypto');

const SECRET_KEY = crypto.createHash('sha256').update('my-secret-key').digest(); // 32 байта
const IV = crypto.randomBytes(16); // Вектор инициализации

function encryptData(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    iv: IV.toString('base64'),
    data: encrypted
  };
}

// Пример
const message = "Привет, клиент!";
const encrypted = encryptData(message);

console.log('👉 Отправляем клиенту:', encrypted);

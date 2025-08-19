const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3002;

// Используем CORS с настройками по умолчанию
app.use(cors({ origin: '*' }));

// Настройка Multer для загрузки
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = '../public/swiftEat/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const randomFileName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        cb(null, randomFileName);
    }
});

const upload = multer({ storage: storage });

// Эндпоинт для загрузки изображений
app.post('/upload', upload.fields([{ name: 'mainImage' }]), (req, res) => {
    const mainImageFiles = req.files['mainImage'];

    // Получаем имена файлов
    const mainImageNames = mainImageFiles ? mainImageFiles.map(file => file.filename) : [];

    // Возвращаем ответ
    return res.json({
        mainImages: mainImageNames,
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
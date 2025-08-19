import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT

const DATA_SECRET_KEY = process.env.DATA_SECRET_KEY // Ключ для генерации IV
const DataBufferKey = Buffer.from(DATA_SECRET_KEY, 'hex');
const ALGORITHM = 'aes-256-cbc'; // Алгоритм для симметричного шифрования
const IV_LENGTH = 16; // Длина вектора инициализации
function generateIV() {
    return crypto.randomBytes(IV_LENGTH);
}
function encryptData(data) {
    const iv = generateIV(); // Генерация случайного IV
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(DataBufferKey, 'utf-8'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}

export async function POST(req) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token || token == null) {
        //console.log('Токен не предоставлен');
        return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    const [role] = await pool.query('SELECT userRole FROM staff WHERE userId = ?', [decoded.id]);
    if (role[0].userRole != 'admin' && decoded.role !== 'admin') {
        return new Response(JSON.stringify({ message: 'Ошибка доступа' }), { status: 401 });
    }

    try {
        const body = await req.json();

        const {
            userId
        } = body;

        const [rows] = await pool.query('SELECT userLogin FROM staff WHERE userId = ?', [userId]);

        function generatePassword(){
            var length = 12,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let res = '';
            for (var i = 0, n = charset.length; i < length; ++i) {
                res += charset.charAt(Math.floor(Math.random() * n));
            }
            return res;
        }
        let newPassword = generatePassword()
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await pool.query('UPDATE staff SET userPassword = ? WHERE userId = ?', [hashedPassword, userId]);

        const dataToEncrypt = JSON.stringify(newPassword);
        const { iv, encryptedData } = encryptData(dataToEncrypt);
        // console.log("OK")
        return new Response(
            JSON.stringify({ userLogin:rows[0].userLogin, password: {encryptedData, iv}, message: 'Пароль обновлен' }),
            { status: 200 }
        );

    } catch (err) {
        console.error('Ошибка регистрации:', err);
        return new Response(
            JSON.stringify({ message: 'Ошибка' }),
            { status: 500 }
        );
    }
}
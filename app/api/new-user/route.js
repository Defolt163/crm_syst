import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT


export async function POST(req) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token || token == null) {
        //// console.log('Токен не предоставлен');
        return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    const [role] = await pool.query('SELECT userRole FROM staff WHERE userId = ?', [decoded.id]);
    if (role[0].userRole != 'admin') {
        return new Response(JSON.stringify({ message: 'Ошибка доступа' }), { status: 401 });
    }

    try {
        const body = await req.json();

        const {
            userName,
            userPost,
            userPhone,
            userEmail,
            userLogin,
            userPassword,
        } = body;

        // console.log(userLogin)

        // Проверка, существует ли пользователь
        const [rows] = await pool.query('SELECT userLogin FROM staff WHERE userLogin = ?', [userLogin]);

        if (rows.length > 0) {
            return new Response(
                JSON.stringify({ message: 'Пользователь уже существует' }),
                { status: 400 }
            );
        } else {
            // Сохранение пользователя в базе данных
            const hashedPassword = await bcrypt.hash(userPassword, 10)
            await pool.query('INSERT INTO staff (userLogin, userPassword, userName, userPhone, userEmail, userPost) VALUES (?, ?, ?, ?, ?, ?)',
                [userLogin, hashedPassword, userName, userPhone, userEmail, userPost]
            );

            return new Response(
                JSON.stringify({ message: 'Пользователь создан' }),
                { status: 201 }
            );
        }
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        return new Response(
            JSON.stringify({ message: 'Ошибка' }),
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT


async function clearNotifications(token) {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.id;

        await pool.query('UPDATE staff SET userNotificationCount = 0 WHERE userId = ?', [userId]);

        return new Response(
            /* JSON.stringify({partInfo, partInfoStaff}), */
            { status: 200 }
        ); 
        
    } catch (error) {
        console.error('Ошибка при декодировании токена или запросе пользователя:', error);
        throw new Error({status: 401});
    }
}

export async function GET(req) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token || token == null) {
        //// console.log('Токен не предоставлен');
        return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
    }

    try {
        const user = await clearNotifications(token);
        //// console.log('Данные пользователя:', user);
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error.message);
        return new Response(JSON.stringify({ message: "Не сегодня" }), { status: 401 });
    }
}
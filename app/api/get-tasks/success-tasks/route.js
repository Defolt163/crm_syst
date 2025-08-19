import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT

async function getTasks(token) {
    try {

        const decoded = jwt.verify(token, SECRET_KEY);

        const userId = decoded.id;
        if(decoded.role !== 'admin' && decoded.role !== 'moder'){
            return new Response(
                JSON.stringify("У вас нет прав"),
                { status: 401 }
            );
        }

        const [rows] = await pool.query('SELECT t.taskId, t.taskDescr, t.taskDeadlines, t.closedOnTime, DATE_FORMAT(t.taskActualClose, "%Y-%m-%dT%TZ") AS taskActualClose, t.taskDateCreate, t.taskGlobalResult, t.taskStatus FROM tasks t WHERE t.taskStatus = "success" AND t.closedOnTime = 1 OR t.closedOnTime = 0');
        //console.log('Результаты запроса в базу данных задач:', rows[0]);
        return rows
        if (rows.length === 0) {
            JSON.stringify({ status: 404 })
        }

        return new Response(
            JSON.stringify({ status: 200 })
        );
    } catch (error) {
        console.error('Ошибка при декодировании токена или запросе пользователя:', error);
        throw new Error('Invalid token or user not found');
    }
}

export async function GET(req) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token || token == null) {
        //console.log('Токен не предоставлен');
        return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
    }

    try {
        const user = await getTasks(token);
        //console.log('Данные пользователя:', user);
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error.message);
        return new Response(JSON.stringify({ message: error.message }), { status: 401 });
    }
}
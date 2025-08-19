import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT


export async function POST(req) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token || token == null) {
        //console.log('Токен не предоставлен');
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
            taskId
        } = body;

        console.log(taskId)

        await pool.query('DELETE FROM taskreports WHERE reportTaskPart IN (SELECT taskPartId FROM taskparts WHERE taskId = ?)', taskId);
        await pool.query('DELETE FROM taskparts WHERE taskId = ?', [taskId]);
        await pool.query('DELETE FROM taskstaff WHERE taskId = ?', [taskId]);
        await pool.query('DELETE FROM tasks WHERE taskId = ?', [taskId]);
        return new Response(
            JSON.stringify({ message: 'Удалено' }),
            { status: 200 }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ message: 'Ошибка' }),
            { status: 500 }
        );
    }
}
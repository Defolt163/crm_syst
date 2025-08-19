import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT

async function getTasks(token) {
    try {

        const decoded = jwt.verify(token, SECRET_KEY);

        const userId = decoded.id;

        const [rows] = await pool.query("WITH user_stats AS ( SELECT COUNT(DISTINCT t.taskId) AS total, SUM(t.taskStatus = 'success') AS completed, SUM(t.taskStatus = 'inWork') AS active, SUM(t.taskStatus = 'success' AND t.closedOnTime = 1) AS on_time, SUM(t.taskStatus = 'success' AND t.closedOnTime = 0) AS late FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE ts.userId = ? ), global_stats AS ( SELECT COUNT(*) AS total, SUM(taskStatus = 'success') AS completed, SUM(taskStatus = 'inWork') AS active, SUM(taskStatus = 'success' AND closedOnTime = 1) AS on_time, SUM(taskStatus = 'success' AND closedOnTime = 0) AS late FROM tasks ) SELECT us.total AS user_total_tasks, us.completed AS user_completed_tasks, us.active AS user_active_tasks, us.on_time AS user_completed_on_time, us.late AS user_completed_late, gs.total AS total_all_tasks, gs.completed AS all_completed_tasks, gs.active AS all_active_tasks, gs.on_time AS all_completed_on_time, gs.late AS all_completed_late FROM user_stats us, global_stats gs;", [userId]);
        
        const result = Object.fromEntries(
            Object.entries(rows[0]).map(([key, value]) => [key, Number(value)])
        );
        return result
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
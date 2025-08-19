import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT


export async function POST(req) {
  try {
        const body = await req.json();

        const {
            userLogin,
            userPassword,
        } = body;

      //// console.log(userLogin)

        // Проверка, существует ли пользователь
        const [rows] = await pool.query('SELECT userId, userLogin, userPassword, userPost, userRole FROM staff WHERE userLogin = ?', [userLogin]);
        if (rows.length === 0) {
            //// console.log('Пользователь не найден');
            return new Response(
                JSON.stringify({ message: 'Не найден' }),
                { status: 404 }
            );
        }
        const user = rows[0];
        //// console.log(user)
        const isMatch = await bcrypt.compare(userPassword, user.userPassword);
        if (!isMatch) {
            //// console.log('Неверный пароль');
            return new Response(
                JSON.stringify({ message: 'Неверный пароль' }),
                { status: 401 }
            );
        }
        const token = jwt.sign({ id: user.userId, post: user.userPost, role: user.userRole, pass: user.userPassword}, SECRET_KEY, {
            expiresIn: '7d',
        });
        return new Response(
            JSON.stringify({ token }),
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

async function getUserFromToken(token) {
    try {
        // console.log('Токен, который пришел на сервер:', token);

        const decoded = jwt.verify(token, SECRET_KEY);
       // console.log('Декодированный токен:', decoded);
        const userId = decoded.id;
        const clientPassword = decoded.pass
        /* const isMatch = await bcrypt.compare(userPassword, user.userPassword);
        if (!isMatch) {
            //// console.log('Неверный пароль');
            return new Response(
                JSON.stringify({ message: 'Неверный пароль' }),
                { status: 401 }
            );
        } */
        const [rows] = await pool.query('SELECT userId, userPassword, userName, userEmail, userPhone, userPost, userRole, userNotificationCount FROM staff WHERE userId = ?', [userId]);
        const [tasks] = await pool.query('SELECT DISTINCT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE ts.userId = ?', [userId]);
        const newToken = jwt.sign(
            {
                id: rows[0].userId,
                name: rows[0].userName,
                email: rows[0].userEmail,
                phone: rows[0].userPhone,
                post: rows[0].userPost,
                role: rows[0].userRole,
                pass: rows[0].userPassword
            },
            SECRET_KEY,
            { expiresIn: '7d' }
        );
        const taskIds = tasks.map(task => task.taskId)
        //// console.log('Результаты запроса в базу данных:', rows);
        const sanitizedRows = rows.map(({ ...rest }) => rest);
        // console.log(rows.length)
        if (rows.length === 0) {
            JSON.stringify({ status: 404 })
        }
        // console.log(sanitizedRows)
        if(rows[0].userPassword === clientPassword){
            return { newToken, rows: sanitizedRows, tasksData: taskIds, status: 200 }
        }
        throw new Error({status: 401});
        
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
        const user = await getUserFromToken(token);
        //// console.log('Данные пользователя:', user);
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (error) {
        console.error('Ошибка при получении пользователя:', error.message);
        return new Response(JSON.stringify({ message: "Не сегодня" }), { status: 401 });
    }
}
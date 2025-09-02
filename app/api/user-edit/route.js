import jwt from 'jsonwebtoken';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT


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
            updateField, 
            newDataField,
            userId
        } = body;

        const allowedFields = ['userName', 'userPhone', 'userEmail', 'userPost']; // Замените на реальные поля вашей базы данных
        if (!allowedFields.includes(updateField)) {
            return res.status(400).json({ error: 'Недопустимое поле для обновления.' });
        }

        await pool.query(`UPDATE staff SET ${updateField} = ? WHERE userId = ?`, [newDataField, userId])

        //console.log("OK")
        return new Response(
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
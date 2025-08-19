import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT

async function getStaffList(token) {
    try {

        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.id;

        const [user] = await pool.query('SELECT userId FROM staff WHERE userId = ?', [userId]);

        if (user.length === 0) {
            throw new Error('User not found');
        }

        const [rows] = await pool.query("SELECT s.userId, s.userPhone, s.userEmail, s.userName, s.userPost, s.userRole, COUNT(CASE WHEN t.taskStatus IN ('created', 'inWork') THEN 1 END) AS active_tasks, COUNT(CASE WHEN t.taskStatus = 'success' THEN 1 END) AS completed_tasks FROM staff s LEFT JOIN taskstaff ts ON s.userId = ts.userId LEFT JOIN tasks t ON ts.taskId = t.taskId GROUP BY s.userId, s.userName, s.userPost ORDER BY s.userName;");
        return rows
    } catch (error) {
        throw new Error('Invalid token or user not found');
    }
}

export async function GET(req) {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token || token == null) {
        return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
    }

    try {
        const staff = await getStaffList(token);
        return new Response(JSON.stringify(staff), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 401 });
    }
}

export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY); //SELECT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE t.taskId = 1 AND ts.userId = 2 LIMIT 1;
    //console.log(decoded.id)
    if(decoded.userRole === 'user'){
        return NextResponse.json(
          {message: "Недостаточно прав"},
          {
            status: 401
          }
        )
    }
    const result = await req.json();
    let userId = Number(result.userId)
    //console.log("ID")
    const [taskRow] = await pool.query('SELECT t.taskId, t.taskDescr, t.taskDeadlines, DATE_FORMAT(t.taskActualClose, "%Y-%m-%dT%TZ") AS taskActualClose, t.taskDateCreate, t.taskGlobalResult, t.taskStatus FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE ts.userId = ?', [userId]);

    //console.log('Результаты запроса в базу данных:', newRows);

    // Преобразуем данные из базы в строку
    //const dataToEncrypt = JSON.stringify(rows);
    // Шифруем данные
    //const { iv, encryptedData } = encryptData(dataToEncrypt);
    return new Response(
        JSON.stringify({taskRow}),
        { status: 200 }
      ); 
  }catch (error){
      return NextResponse.json(
        {message: "Ошибка доступа"},
        {
          status: 401
        }
      )
    }
}
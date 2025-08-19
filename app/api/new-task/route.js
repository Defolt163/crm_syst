import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT

const DATA_SECRET_KEY = process.env.DATA_SECRET_KEY /* '16cf126a9dc4e39e405a03ad0fb2f31d91f6b73342c7d7647772e104aa8d7e39'; */ // Ключ для генерации IV
const DataBufferKey = Buffer.from(DATA_SECRET_KEY, 'hex');
const ALGORITHM = 'aes-256-cbc'; // Алгоритм для симметричного шифрования
const IV_LENGTH = 16; // Длина вектора инициализации
// Функция для генерации случайного IV
/* function generateIV() {
    return crypto.randomBytes(IV_LENGTH);
}
function encryptData(data) {
    const iv = generateIV(); // Генерация случайного IV
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(DataBufferKey, 'utf-8'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
} */

export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const result = await req.json();
  // console.log(result)
  const {
      taskDescr,
      taskGlobalResult,
      addedUser,
      taskParts
  } = result;
  // console.log("ya",result.taskParts[0].dateRange)

  if (!token) {
    return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY); //SELECT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE t.taskId = 1 AND ts.userId = 2 LIMIT 1;
    // console.log(decoded.id)
    if(decoded.role !== 'admin' && decoded.role !== 'moder'){
      return new Response(
        JSON.stringify("У вас нет прав"),
        { status: 401 }
      );
    }
    let taskDeadLine = [result.taskParts[0].dateRange.from, result.taskParts[result.taskParts.length-1].dateRange.to]
    const formatDeadline = (deadline) => {
    const [start, end] = deadline;
    // Форматируем даты в 'YYYY-MM-DD' (месяцы в JS начинаются с 0, поэтому +1)
    const startDate = `${start[2]}-${String(start[1]).padStart(2, '0')}-${String(start[0]).padStart(2, '0')}`;
    const endDate = `${end[2]}-${String(end[1]).padStart(2, '0')}-${String(end[0]).padStart(2, '0')}`;
    return `${startDate} - ${endDate}`;
  };

  const formattedDeadline = formatDeadline(taskDeadLine);

    const [newTaskResult] = await pool.query('INSERT INTO tasks (taskDescr, taskDeadlines, taskCustomerId, taskGlobalResult, taskStatus) VALUES (?, ?, ?, ?, ?);',
      [taskDescr, formattedDeadline, decoded.id, taskGlobalResult, 'created']
    );

    const newTaskId = newTaskResult.insertId;

    const taskPartsArray = [...new Set([...taskParts])];

    if (taskPartsArray.length > 0) {
      const values = taskPartsArray.map(partId => [newTaskId, formatDeadline([partId.dateRange.from,partId.dateRange.to]), partId.name, partId.result]);
      // console.log('values', values)
      await pool.query(
        `INSERT INTO taskparts (taskId, taskPartDeadline, taskPartName, taskPartResult) VALUES ?`,
        [values]
      );
    }
   const taskStaffArray = [...new Set([...addedUser])];
    if (taskStaffArray.length > 0) {
      const values = taskStaffArray.map(user => [newTaskId, user.userId, user.taskPost]);
      // console.log('values', values)
      await pool.query(
        `INSERT INTO taskstaff (taskId, userId, taskPost) VALUES ?`,
        [values]
      );
    }
    
    return new Response(
        JSON.stringify("OK"),
        { status: 200 }
      ); 
  }catch (error){
    // console.log(error)
      return NextResponse.json(
        {message: "Ошибка доступа"},
        {
          status: 401
        }
      )
    }
}
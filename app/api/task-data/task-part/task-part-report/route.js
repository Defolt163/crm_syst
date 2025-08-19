import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../../server'

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
  let taskId = Number(result.taskId)
  let partId = Number(result.partId)
  const {
      status,
      selectedStaff,
      partResult
  } = result;

  if (!token) {
    return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY); //SELECT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE t.taskId = 1 AND ts.userId = 2 LIMIT 1;
    // console.log(decoded.id)
    const [checkUserTask] = await pool.query('SELECT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE t.taskId = ? AND ts.userId = ? LIMIT 1;', [taskId, decoded.id]);
    // console.log(checkUserTask.length == 0)
    if(checkUserTask.length == 0){
      return NextResponse.json(
        {message: "Ошибка доступа"},
        {
          status: 401
        }
      )
    }
    const [reportResult] = await pool.query('INSERT INTO taskreports (reportTaskPart, reportStatus, reportDescr, reportUserId) VALUES (?, ?, ?, ?);',
      [partId, status, partResult, decoded.id]
    );

    const newReportId = reportResult.insertId;

    const allParticipants = [...new Set([...selectedStaff])];

    if (allParticipants.length > 0) {
      const values = allParticipants.map(userId => [newReportId, userId]);
      await pool.query(
        `INSERT INTO taskreport_staff (taskReportId, userId) VALUES ?`,
        [values]
      );
    }
    
    return new Response(
        /* JSON.stringify({partInfo, partInfoStaff}), */
        { status: 200 }
      ); 
  }catch (error){
    // console.log("ERROR", error)
      return NextResponse.json(
        {message: "Ошибка доступа"},
        {
          status: 401
        }
      )
    }
}
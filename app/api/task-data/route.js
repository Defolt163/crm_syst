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
  let taskId = Number(result.taskId)

  if (!token) {
    return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY); //SELECT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE t.taskId = 1 AND ts.userId = 2 LIMIT 1;
    //console.log(decoded.id)
    if(decoded.role === 'user'){
      const [checkUserTask] = await pool.query('SELECT t.taskId FROM tasks t JOIN taskstaff ts ON t.taskId = ts.taskId WHERE t.taskId = ? AND ts.userId = ? LIMIT 1;', [taskId, decoded.id]);
      if(checkUserTask.length == 0){
        return NextResponse.json(
          {message: "Доступ к задаче закрыт"},
          {
            status: 401
          }
        )
      }
    }
    const [taskRow] = await pool.query('SELECT t.taskId, t.taskDescr, t.taskDeadlines, t.taskDateCreate, t.taskGlobalResult, t.taskFacticalResult, s.userName AS customerName, s.userPost AS customerPost, s.userPhone AS customerPhone FROM tasks t LEFT JOIN staff s ON t.taskCustomerId = s.userId WHERE t.taskId = ?', [taskId]);
    const [taskParts] = await pool.query(`SELECT taskPartId, taskPartName, taskPartDeadline, taskPartResult FROM taskparts WHERE taskId = ?`, [taskId]);

    const [taskStaff] = await pool.query(`SELECT s.userId, s.userName, s.userPost, ts.taskPost AS userTaskPost, s.userPhone, s.userEmail FROM taskstaff ts JOIN staff s ON ts.userId = s.userId WHERE ts.taskId = ?`, [taskId]);

    const [taskReports] = await pool.query(`SELECT tr.taskReportId, tr.reportTime, tr.reportStatus, tr.reportDescr, tr.reportTaskPart AS taskPartId, tp.taskPartName AS taskPartName, author.userName AS reportAuthorName, GROUP_CONCAT(DISTINCT s.userName SEPARATOR ', ') AS participantNames FROM taskreports tr JOIN staff author ON author.userId = tr.reportUserId JOIN taskparts tp ON tr.reportTaskPart = tp.taskPartId LEFT JOIN taskreport_staff trs ON trs.taskReportId = tr.taskReportId LEFT JOIN staff s ON s.userId = trs.userId WHERE tr.reportTaskPart IN ( SELECT taskPartId FROM taskparts WHERE taskId = ? ) GROUP BY tr.taskReportId ORDER BY tr.reportTime;`, [taskId]);
    const formattedReports = taskReports.map(report => ({
      taskReportId: report.taskReportId,
      taskPartId: report.taskPartId,
      taskPartName: report.taskPartName,
      reportTime: report.reportTime,
      reportStatus: report.reportStatus,
      reportDescr: report.reportDescr,
      reportAuthorName: report.reportAuthorName,
      reportParticipants: report.participantNames ? report.participantNames.split(', ') : []
    }));


    const result = {
      ...taskRow[0],          // Данные задачи
      taskParts,               // Массив этапов
      taskStaff,
      formattedReports
    }
    //console.log('Результаты запроса в базу данных:', newRows);

    // Преобразуем данные из базы в строку
    //const dataToEncrypt = JSON.stringify(rows);
    // Шифруем данные
    //const { iv, encryptedData } = encryptData(dataToEncrypt);
    return new Response(
        JSON.stringify({result}),
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
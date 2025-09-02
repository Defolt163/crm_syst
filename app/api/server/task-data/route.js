import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../server'

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
  //const token = req.headers.get('authorization')?.split(' ')[1];
  const result = await req.json();
  let taskId = Number(result.taskId)
  let post = result.post
  
  try {
    if(post !== 'SEVER'){
      return new Response(
        JSON.stringify({message: "Неверный токен"}),
        { status: 401 }
      ); 
    }
    const [rows] = await pool.query('SELECT taskFacticalResult FROM tasks WHERE taskStatus = "success" AND taskId = ?', [taskId]);
    console.log(rows.length)
    if (rows.length == 0 || rows[0].taskFacticalResult !== null) {
        return new Response(
          JSON.stringify({message: "Пусто"}),
          { status: 404 }
        ); 
    }

    const [taskRow] = await pool.query('SELECT t.taskId, t.taskDescr, t.taskGlobalResult FROM tasks t LEFT JOIN staff s ON t.taskCustomerId = s.userId WHERE t.taskId = ?', [taskId]);
    const [taskParts] = await pool.query(`SELECT taskPartId, taskPartName, taskPartResult FROM taskparts WHERE taskId = ?`, [taskId]);

    /* const [taskReports] = await pool.query(`SELECT tr.taskReportId, tr.reportStatus, tr.reportDescr, tr.reportTaskPart AS taskPartId, tp.taskPartName AS taskPartName, author.userName AS reportAuthorName, GROUP_CONCAT(DISTINCT s.userName SEPARATOR ', ') AS participantNames FROM taskreports tr JOIN staff author ON author.userId = tr.reportUserId JOIN taskparts tp ON tr.reportTaskPart = tp.taskPartId LEFT JOIN taskreport_staff trs ON trs.taskReportId = tr.taskReportId LEFT JOIN staff s ON s.userId = trs.userId WHERE tr.reportTaskPart IN ( SELECT taskPartId FROM taskparts WHERE taskId = ? );`, [taskId]); */
    const [taskReports] = await pool.query(`SELECT tr.taskReportId, tr.reportStatus, tr.reportDescr, tr.reportTaskPart AS taskPartId, tp.taskPartName AS taskPartName, author.userName AS reportAuthorName, GROUP_CONCAT(DISTINCT s.userName SEPARATOR ', ') AS participantNames FROM taskreports tr JOIN staff author ON author.userId = tr.reportUserId JOIN taskparts tp ON tr.reportTaskPart = tp.taskPartId LEFT JOIN taskreport_staff trs ON trs.taskReportId = tr.taskReportId LEFT JOIN staff s ON s.userId = trs.userId WHERE tr.reportTaskPart IN (SELECT taskPartId FROM taskparts WHERE taskId = ?) GROUP BY tr.taskReportId, tr.reportStatus, tr.reportDescr, tr.reportTaskPart, tp.taskPartName, author.userName;`, [taskId]);
    const formattedReports = taskReports.map(report => ({
      taskReportId: report.taskReportId,
      taskPartId: report.taskPartId,
      taskPartName: report.taskPartName,
      reportTime: report.reportTime,
      reportStatus: report.reportStatus,
      reportDescr: report.reportDescr
    }));

    const result = {
      ...taskRow[0],          // Данные задачи
      taskParts,               // Массив этапов
      formattedReports
    }

    return new Response(
        JSON.stringify({result}),
        { status: 200 }
      ); 
  }catch (error){
      console.log(error)
      return NextResponse.json(
        {message: "Ошибка доступа"},
        {
          status: 401
        }
      )
    }
}
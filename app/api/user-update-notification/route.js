import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT
const SERVER_KEY = process.env.SERVER_JWT


export async function POST(req) {
  const result = await req.json();
  console.log("RES",result)
  const {
      userIds,
      post,
      status
  } = result;
  

  if (post !== 'SEVER') {
    return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
  }
  if (status === 'report'){
    await pool.query(`UPDATE staff s JOIN taskstaff ts ON s.userId = ts.userId SET s.userNotificationCount = s.userNotificationCount + 1 WHERE ts.taskId = ?;`, userIds);
    return new Response(JSON.stringify({ message: 'OK' }), { status: 200 });
  }

  const placeholders = userIds.map(() => '?').join(',')
  
  try {
    await pool.query(`UPDATE staff SET userNotificationCount = userNotificationCount + 1 WHERE userId IN (${placeholders});`, userIds);

    return new Response(
        /* JSON.stringify({partInfo, partInfoStaff}), */
        { status: 200 }
      ); 
  }catch (error){
    console.log("ERROR", error)
      return NextResponse.json(
        {message: "Ошибка доступа"},
        {
          status: 401
        }
      )
    }
}
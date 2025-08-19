import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT
const SERVER_KEY = process.env.SERVER_JWT


export async function POST(req) {
  const result = await req.json();
  console.log("RES",result)
  const {
      taskId,
      post,
      report
  } = result;
  

  if (post !== 'SEVER') {
    return new Response(JSON.stringify({ message: 'Tокен не предоставлен' }), { status: 401 });
  }
  try {
    await pool.query(`UPDATE tasks SET taskFacticalResult = ? WHERE taskId = ?;`, [report, taskId]);

    return new Response(
        null,
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
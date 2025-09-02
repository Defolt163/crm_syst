import { NextRequest, NextResponse } from "next/server"
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../../server'

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Секрет для JWT

export async function POST(req) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const result = await req.json();
  // console.log(result)
  const {
      addedUser,
      taskId
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

   const taskStaffArray = [...new Set([...addedUser])];
    if (taskStaffArray.length > 0) {
      const values = taskStaffArray.map(user => [taskId, user.userId, user.taskPost]);
      //console.log('values', values)
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
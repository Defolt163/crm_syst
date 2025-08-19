import mysql from 'mysql2/promise';

// Получение данных из файла окружения
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Создание подключения к базе данных
const accountDB = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 20
});
export default accountDB;

/* accountDB.connect(err =>{
    if(err){
        console.error("Ошибка подключения к бд", err)
    } else {
        console.log("Connect OK")
    }
})

module.exports = accountDB */
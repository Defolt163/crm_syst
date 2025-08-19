const axios = require("axios");
const { headers } = require('next/headers');
const io = require("socket.io")(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

console.log("Socket server started");

io.on("connection", (socket) => {
  console.log("✅ User connected");

  socket.on("taskCreate", (users) => {
    console.log(`Task Created for users: `, users);
    socket.broadcast.emit("taskCreated", users); // Остальные водители
    fetch('http://localhost:3000/api/user-update-notification',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "userIds": users,
        "post": "SEVER",
        "status": "task"
      })
    }).then(()=>{
      console.log("UPDATED")
    }).catch((err)=>{
      console.log(err)
    })
  });
  socket.on("taskReport", (taskId, user, taskPart) => {
    console.log(`Пользователь ${user}, добавил отчет в задачу ${taskId}, по этапу ${taskPart}`);

    fetch('http://localhost:3000/api/user-update-notification',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "userIds": taskId,
        "post": "SEVER",
        "status": "report"
      })
    }).then((res)=>{
      return res.json()
    }).then((result)=>{
      console.log(result)
      getTaskData(taskId)
    })
    .catch((err)=>{
      console.log(err)
    })
    socket.broadcast.emit("taskReported", Number(taskId), user, taskPart); // Остальные водители
  });
});


async function analyzeWithAI(promt) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'custom_vikhr',  // Или 'phi3:mini'
        prompt: promt,
        stream: false  // Для простого ответа
      })
    });
    const data = await response.json();
    console.log(data.response)
    return data.response.trim();
  } catch (error) {
    console.error('Ошибка запроса к Ollama:', error);
    return "Не удалось проанализировать отчёт.";
  }
}

// Пример вызова
/* analyzeWithAI()
  .then(response => console.log(response));
 */
async function getTaskData(taskId){
  try{
    const response = await fetch('http://localhost:3000/api/server/task-data',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "taskId": taskId,
        "post": "SEVER"
      })
    })
    if (response.status === 200) {
        const res = await response.json();
        const data = res.result || {};
        console.log(data)
        let promt = `
          Проект: ${data.taskDescr}
          Ожидаемый итог проекта: ${data.taskGlobalResult}

          Ниже список этапов. Для каждого этапа указано ожидаемое задание и текущий статус выполнения:

          ${data.taskParts.map((part) => {
            let reports = data.formattedReports
              .filter(r => r.taskPartId === part.taskPartId)
              .map(r => `Статус: ${r.reportStatus}, Отчёт: ${r.reportDescr}`)
              .join("; ") || "Этап не начат";

            return `Этап: ${part.taskPartName}
          Ожидание: ${part.taskPartResult}
          Факт: ${reports}`;
          }).join("\n\n")}

          На основе этих данных сделай краткое заключение: насколько проект близок к финальному результату. Не придумывай факты — используй только указанные данные.
          `;
        analyzeWithAI(promt).then(response => pushTaskReport(taskId, response));
    }
  }catch(err){
    console.error("Ошибка запроса:", err);
  }
}
async function pushTaskReport(taskId, aiReport){
  fetch('http://localhost:3000/api/server/task-data/ai-report',{
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "taskId": taskId,
        "post": "SEVER",
        "report": aiReport
      })
    }).then(()=>{
      console.log("OK")
    })
    .catch((err)=>{
      console.log(err)
    })
}

'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useData } from "../DataContext"
import { toast } from "sonner"
import { eventBus } from "@/app/utils/eventBus"

export default function TableTasks(props){
    const { userData } = useData()
    const { selectedItems } = props
    const { searchTable  } = props
    const { selectedType } = props
    const [tasks, setTasks] = useState([])
    const [noTasks, setNoTasks] = useState(false)

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    const sortTasksByStatus = (tasksArray) => {
        const statusOrder = { created: 1, inWork: 2, success: 3 };
        
        return [...tasksArray].sort((a, b) => {
        const aStatus = statusOrder[a.taskStatus] || 4;
        const bStatus = statusOrder[b.taskStatus] || 4;
        return aStatus - bStatus;
        });
    };

    async function getAllTasks(){
        const token = getCookie('token');
        await fetch('/api/get-tasks/all-tasks',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        ).then((res)=>{
            return res.json()
        }).then((result)=>{
            const sorted = sortTasksByStatus(result)
            setTasks(sorted)
            console.log('result',result)
            if(result.length == 0){
                setNoTasks(true)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }
    useEffect(()=>{
        if(selectedType === 'allTasks'){
            getAllTasks()
        }else{
            getTask()
        }
    },[selectedType])
    async function getTask(){
        const token = getCookie('token');
        await fetch('/api/get-tasks',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        ).then((res)=>{
            return res.json()
        }).then((result)=>{
            const sorted = sortTasksByStatus(result)
            setTasks(sorted)
            console.log('result',result)
            if(result.length == 0){
                setNoTasks(true)
            }
        }).catch((err)=>{
            console.log(err)
        })
    }
    useEffect(()=>{
        getTask()
    },[])

    useEffect(() => {
        const handleRefresh = () => {
            getTask();
        };

        eventBus.on("refreshTable", handleRefresh);

        return () => {
            eventBus.off("refreshTable", handleRefresh); // важно отписываться
        };
    }, []);

    const selectedStatusIds = selectedItems?.map(item => item.id) || [];

    const filteredTasks = (Array.isArray(tasks) ? tasks : [])
        .filter(task => {
            // Фильтрация по статусу
            const statusMatch = selectedStatusIds.length > 0 
                ? selectedStatusIds.includes(task.taskStatus)
                : true;
            
            // Фильтрация по поиску (с проверкой на undefined/null)
            const searchMatch = (typeof searchTable === 'string' && searchTable.trim().length > 0)
                ? task.taskDescr?.toLowerCase().includes(searchTable.toLowerCase())
                : true;
            
            return statusMatch && searchMatch;
        })
        .sort((a, b) => b.taskId - a.taskId)

    async function removeTask(taskId){
        const token = getCookie('token');
        toast.info("Удаление...")
        await fetch('/api/task-data/delete-task',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    taskId: taskId
              }),
            }
        ).then(()=>{
            setTasks(tasks.filter(task => task.taskId !== taskId));
            toast.success("Задача удалена")
        }).catch(()=>{
            toast.error("Ошибка сервера")
        })
    }

    return(
        <div className={`rounded-md border border-gray-200 ${props.width}`}>
            <Table>
                <TableHeader>
                    <TableRow className={"border-gray-200 text-gray-700"}>
                    <TableHead className="w-[100px]">Задача</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Сроки</TableHead>
                    <TableHead>Дата завершения</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действие</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length == 0 && !noTasks ?
                        (<>
                            <TableRow className={"border-gray-200"}>
                                <TableCell className={'py-4'}><Skeleton className="h-4 w-[60px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[260px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[160px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[60px]"></Skeleton></TableCell>
                            </TableRow>
                            <TableRow className={"border-gray-200"}>
                                <TableCell className={'py-4'}><Skeleton className="h-4 w-[60px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[260px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[160px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[60px]"></Skeleton></TableCell>
                            </TableRow>
                            <TableRow className={"border-gray-200"}>
                                <TableCell className={'py-4'}><Skeleton className="h-4 w-[60px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[260px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[160px]"></Skeleton></TableCell>
                                <TableCell><Skeleton className="h-4 w-[60px]"></Skeleton></TableCell>
                            </TableRow>
                        </>) :
                        noTasks ? <TableRow key={tasks.length++} className={"border-gray-200"}><TableCell colSpan="2"><h2>У вас нет активных задач</h2></TableCell></TableRow> :
                        (filteredTasks && filteredTasks.map(task => (
                            <TableRow key={tasks.length++} className={"border-gray-200"}>
                                <TableCell className="font-medium py-4">Задача-{task.taskId}</TableCell>
                                <TableCell>{task.taskDescr}</TableCell>
                                <TableCell>{task.taskDeadlines}</TableCell>
                                <TableCell>{task.taskActualClose}</TableCell>
                                <TableCell>{task.taskStatus && task.taskStatus == "created" ? "Создан" : task.taskStatus == "inWork" ? "В работе" : "Выполнен"}</TableCell>
                                <TableCell className={"text-2xl leading-[0] flex cursor-pointer py-4"}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            ...
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className={'bg-white p-2'}>
                                            <DropdownMenuLabel>Действие</DropdownMenuLabel>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem><Link href={`/dashboard/tasks/${task.taskId}`}>Открыть</Link></DropdownMenuItem>
                                                {userData?.userRole === 'admin' ? 
                                                    <DropdownMenuItem><h3 onClick={()=>{removeTask(task.taskId)}}>Удалить</h3></DropdownMenuItem> : null
                                                }
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )))
                    }
                </TableBody>
            </Table>
        </div>
    )
}
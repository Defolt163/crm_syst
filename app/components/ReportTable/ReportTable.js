'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function ReportTable(props){
    const [tasks, setTasks] = useState([])
    const { selectedItems } = props
    const { searchTable  } = props
    const { setPercentCloseOnTimeTasks } = props
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    const token = getCookie('token');
    useEffect(()=>{
        fetch('/api/get-tasks/success-tasks',
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
            setTasks(result)
            console.log('result',result)
        })
    }, [])
    
    useEffect(()=>{
        const countCloseOnTimeTasks = tasks.filter(task => task.closedOnTime === 1).length
        const percentCloseOnTimeTasks = Math.round((countCloseOnTimeTasks/tasks.length)*100)
        setPercentCloseOnTimeTasks(percentCloseOnTimeTasks)
    }, [tasks])
    const selectedStatusIds = selectedItems?.map(item => item.id) || [];

    const filteredTasks = (Array.isArray(tasks) ? tasks : []).filter(task => {
        // Фильтрация по статусу
        const statusMatch = selectedStatusIds.length > 0 
            ? selectedStatusIds.includes(task.closedOnTime)
            : true;
        
        // Фильтрация по поиску
        const searchMatch = searchTable.trim().length > 0
            ? task.taskDescr?.toLowerCase().includes(searchTable.toLowerCase())
            : true;
        
        return statusMatch && searchMatch;
    });
    return(
        <div className={`rounded-md border border-gray-200 ${props.width}`}>
            <Table>
                <TableHeader>
                    <TableRow className={"border-gray-200 text-gray-700"}>
                    <TableHead className="w-[100px]">Задача</TableHead>
                    <TableHead className="w-[50%]">Описание</TableHead>
                    <TableHead>Сроки</TableHead>
                    <TableHead>Дата завершения</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действие</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTasks?.map((task)=>(
                        <TableRow key={task.taskId} className={"border-gray-200"}>
                            <TableCell className="font-medium py-4">TASK-{task.taskId}</TableCell>
                            <TableCell>{task.taskDescr}</TableCell>
                            <TableCell>{task.taskDeadlines}</TableCell>
                            <TableCell>{task.taskActualClose}</TableCell>
                            <TableCell>{task.closedOnTime == 1 ? "В срок" : task.closedOnTime == 0 ? "Задержка" : "В работе"}</TableCell>
                            <TableCell className={"text-2xl leading-[0] flex cursor-pointer py-4"}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        ...
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className={'bg-white p-2'}>
                                        <DropdownMenuLabel>Действие</DropdownMenuLabel>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem><Link href={`tasks/${task.taskId}`}>Открыть</Link></DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
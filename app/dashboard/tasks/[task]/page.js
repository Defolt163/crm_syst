'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PagesHeader from "../../../components/PagesHeader/PagesHeader";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SkeletonPage from "@/app/components/SkeletonPage/SkeletonPage";
import { eventBus } from "@/app/utils/eventBus";
import { useData } from "@/app/components/DataContext";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";

export default function ActiveTaskPage({ params }){
    const { userData } = useData()
    const unwrappedParams = use(params);
    const taskId = unwrappedParams.task;
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    const [taskData, setTaskdata] = useState([])
    const [accessDenied, setAccessDenied] = useState(false);
    async function getTaskData(){
        const token = getCookie('token');
        try{
            const response = await fetch(`/api/task-data`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    taskId: taskId,
                })
            })
            if (response.status === 200) {
                const res = await response.json();
                const data = res.result || {};
                setTaskdata(data);
            } else {
                setAccessDenied(true);
            }
        }catch (err) {
            console.error("Ошибка запроса:", err);
        }
        /* fetch(`/api/task-data`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                taskId: taskId,
            })
        }).then((result)=>{
            console.log(result)
            if(result.status == 200){
                const res = await result.json()
            }else{
                setAccessDenied(true)
                throw new Error("Доступ запрещен")
            }
        }).then((res)=>{
            const data = res.result || {};
            setTaskdata(data)
        }).catch((err)=>{
            console.error(err)
        }) */
    }
    useEffect(()=>{
        getTaskData()
    },[taskId])
    useEffect(() => {
        const handleRefresh = () => {
            getTaskData(); // или setUpdateFlag(true) и т.д.
        };

        eventBus.on("refreshTask", handleRefresh);

        return () => {
            eventBus.off("refreshTask", handleRefresh); // важно отписываться
        };
    }, []);

    if(accessDenied){
        return(
            <div>
                <h2 className="text-2xl text-red-700 font-semibold">Доступ воспрещен!</h2>
                <h2 className="text-xl text-gray-700 font-semibold">Вы не относитесь к данной задаче</h2>
            </div>
        )
    }if(!accessDenied && taskData.length == 0){
        return(
            <SkeletonPage/>
        )
    }

    return(
        <div>
            <PagesHeader header={"TASK-221"}/>
            <div className="flex">
                <Avatar className={'w-[90px] h-auto'}>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(taskData.customerName)}&chars=1`} />
                    <AvatarFallback>🙂</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex flex-col justify-between">
                    <h2 className="font-medium text-xl">{taskData.customerName}</h2>
                    <h3 className="text-gray-600">{taskData.customerPost}</h3>
                    <h3 className="text-gray-600">{taskData.customerPhone}</h3>
                </div>
            </div>
            <div className="my-4">
                <h3 className="font-medium">Создан: {taskData.taskDateCreate}</h3>
                <p className="w-2/3 my-2"><strong>Описание задачи:</strong> {taskData.taskDescr}</p>
                <h3 className="font-medium">Срок: {taskData.taskDeadlines}</h3>
            </div>
            <div className="mb-4">
                <h3 className="font-medium mb-2">Этапы:</h3>
                <div className="w-2/3 border border-gray-200 rounded-md">
                    <Table className={''}>
                        <TableHeader>
                            <TableRow className={"border-gray-200 text-gray-700"}>
                            <TableHead className="w-[100px]">Срок</TableHead>
                            <TableHead>Этап</TableHead>
                            <TableHead>Ожидаемый результат</TableHead>
                            <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taskData.taskParts.map((part)=>{
                                const completedReports = taskData.formattedReports.filter(report => report.taskPartId === part.taskPartId && report.reportStatus === 'Выполнен');
                                return (
                                <TableRow key={taskData.taskParts.length++} className={`border-gray-200
                                    ${completedReports.length > 0 ? 'bg-green-100' : ''}`}>
                                    <TableCell className="font-medium py-4">{part.taskPartDeadline}{part.taskPartId}</TableCell>
                                    <TableCell className={'whitespace-normal break-words w-[250px]'}>{part.taskPartName}</TableCell>
                                    <TableCell className={'whitespace-break-spaces break-words'}>{part.taskPartResult}</TableCell>
                                    <TableCell className={"text-2xl leading-[0] flex cursor-pointer caption-center py-4"}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                    size="icon"
                                                >
                                                    <IconDotsVertical/>
                                                    <span className="sr-only">Открыть</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            {/* <DropdownMenuTrigger className="cursor-pointer">
                                                ...
                                            </DropdownMenuTrigger> */}
                                            <DropdownMenuContent className={'bg-white p-2'}>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem><Link href={`${taskId}/${part.taskPartId}`}>Заполнить отчет</Link></DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                        <TableHeader>
                            <TableRow className={"border-gray-200 bg-stone-200"}>
                                <TableHead colSpan={4} className="">Ожидаемый результат работы</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className={"border-gray-200"}>
                                <TableCell colSpan={4} className="font-medium py-4 whitespace-break-spaces break-words">{taskData.taskGlobalResult}</TableCell>
                            </TableRow>
                        </TableBody>
                        <TableHeader>
                            <TableRow className={"border-gray-200 bg-stone-200"}>
                                <TableHead colSpan={4} className="">Фактический результат работы</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className={"border-gray-200"}>
                                <TableCell colSpan={4} className="font-medium py-4 whitespace-break-spaces break-words">{taskData.taskFacticalResult || "Задача еще не выполнена"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="mb-4">
                <h3 className="font-medium mb-2">Команда:</h3>
                <div className="w-2/3 border border-gray-200 rounded-md">
                    <Table className={''}>
                        <TableHeader>
                            <TableRow className={"border-gray-200 text-gray-700"}>
                                <TableHead >ФИО</TableHead>
                                <TableHead>Должность</TableHead>
                                <TableHead>Статус в проекте</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taskData.taskStaff.map((user)=>(
                                <TableRow key={taskData.taskStaff.length++} className={"border-gray-200"}>
                                    <TableCell className="font-medium py-4">{user.userName}</TableCell>
                                    <TableCell>{user.userPost}</TableCell>
                                    <TableCell>{user.userTaskPost}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="mb-4">
                <h3 className="font-medium mb-2">Отчет по работе:</h3>
                <div className="w-2/3 border border-gray-200 rounded-md">
                    {taskData.formattedReports.map((report)=>(
                        <Table key={taskData.formattedReports.length++} className={'w-full'}>
                            <TableHeader>
                                <TableRow className={"border-gray-200 text-gray-700"}>
                                <TableHead className="w-[100px]">Время</TableHead>
                                <TableHead>Этап</TableHead>
                                <TableHead>ФИО</TableHead>
                                <TableHead>Статус</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className={"border-gray-200"}>
                                    <TableCell className="font-medium py-4 whitespace-normal">{report.reportTime}</TableCell>
                                    <TableCell className={'whitespace-normal'}>{report.taskPartName}</TableCell>
                                    <TableCell>
                                        <span className="font-semibold">{report.reportAuthorName} <br/></span>
                                        {report.reportParticipants && report.reportParticipants.map((user)=>(
                                            user !== report.reportAuthorName ?<span key={report.reportParticipants.length++}><h2>{user}</h2> <br/></span> : null
                                        ))}
                                    </TableCell>
                                    <TableCell className={`whitespace-normal w-[95px] ${report.reportStatus == 'В работе' ? `bg-orange-700` : report.reportStatus == 'Выполнен' ? `bg-green-700` : `bg-orange-400`}`}>{report.reportStatus}</TableCell>
                                </TableRow>
                            </TableBody>
                        <TableHeader>
                            <TableRow className={"border-gray-200 bg-stone-200"}>
                                <TableHead colSpan={4} className="">Описание</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className={"border-gray-200"}>
                                <TableCell colSpan={4} className="font-medium py-4 w-full whitespace-normal">{report.reportDescr}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    ))}
                </div>
            </div>
        </div>
    )
}
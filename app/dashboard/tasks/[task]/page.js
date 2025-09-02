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
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { ChevronsUpDownIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import useSocket from "@/app/components/useSocket";

export default function ActiveTaskPage({ params }){
    const { userData } = useData()
    const socketRef = useSocket(); // подключение
    const socket = socketRef.current;
    useEffect(() => {

        if (!socket || !userData) return;

        return () => {
        socket.off("taskCreate");
        };
    }, [userData]);
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
    }
    useEffect(()=>{
        getTaskData()
    },[taskId])

    const [staff, setStaff] = useState([])
    const [staffIsLoading, setStaffIsLoading] = useState(false)
    async function getStaff(){
        if (staff.length == 0){
            setStaffIsLoading(true)
            const token = getCookie('token')
            await fetch('/api/staff-list',
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
                //console.log(result)
                setStaff(result)
                setStaffIsLoading(false)
            })
        }
        setStaffIsLoading(false)
    }
    const [alertAddUserToTask, setAlertAddUserToTask] = useState(false)
    const [addedUser, setAddedUser] = useState([])

    const toggleItem = (user) => {
        const taskStaffUserIds = new Set(taskData.taskStaff.map(staff => staff.userId));
  
        if (taskStaffUserIds.has(user.userId)) {
            toast.warning("Пользователь уже состоит в задаче")
            return;
        }
        setAddedUser(prev => {
        const existingUserIndex = prev.findIndex(u => u.userId === user.userId);
        
        if (existingUserIndex >= 0) {
            // Если пользователь уже есть - удаляем
            return prev.filter(u => u.userId !== user.userId);
        } else {
            // Добавляем нового пользователя с дефолтной должностью
            return [...prev, { 
            userId: user.userId, 
            userName: user.userName, // сохраняем имя для отображения
            userPost: user.userPost,
            taskPost: "Сотрудник" // дефолтное значение
            }];
        }
        });
    };

    const handlePostChange = (userId, newPost) => {
    setAddedUser(prev => 
        prev.map(user => 
        user.userId === userId 
            ? { ...user, taskPost: newPost } 
            : user
        )
    );
    };

    useEffect(()=>{
        console.log(addedUser)
        console.log(taskData)
    },[taskData, addedUser])

    async function addUserToTask(){
        const token = getCookie('token')
        try{
            const response = await fetch('/api/task-data/add-user-task',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        taskId: taskData.taskId,
                        addedUser: addedUser
                    })
                }
            )
            if(!response.ok){
                toast.error(`Ошибка добавления`)
            }
            toast.success(`Сотрудник добавлен`)
            setTaskdata(prevTaskData => ({
                ...prevTaskData,
                taskStaff: prevTaskData.taskStaff.concat(addedUser)
            }));
            socket.emit("taskCreate", addedUser.map((user)=>(user.userId)))
            setAddedUser([])
            console.log("112", taskData)
        }
        catch{
            toast.error(`Ошибка сервера`)
        }
    }

    useEffect(() => {
        const handleRefresh = () => {
            getTaskData(); // или setUpdateFlag(true) и т.д.
        };

        eventBus.on("refreshTask", handleRefresh);

        return () => {
            eventBus.off("refreshTask", handleRefresh); // важно отписываться
        };
    }, []);
    const [open, setOpen] = useState(false)

    async function removeUserFromTask(userId){
        const token = getCookie('token')
        try{
            const response = await fetch('/api/user-edit/remove-user-from-task',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId: userId,
                        taskId: taskData.taskId,
                    })
                }
            )
            if(!response.ok){
                toast.error(`Ошибка снятия с задачи`)
            }
            toast.success(`Сотрудник снят с задачи`)
            //setTaskdata(taskData.taskStaff.filter(user => user.userId !== userId));
            setTaskdata(prevTaskData => ({
                ...prevTaskData,
                taskStaff: prevTaskData.taskStaff.filter(staff => staff.userId !== userId)
            }));
            //console.log("222", taskData)
        }
        catch (err){
            toast.error(`Ошибка сервера ${err}`)
        }
    }

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
            <PagesHeader header={`Задача-${taskData?.taskId}`}/>
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
                            {taskData?.taskParts?.map((part)=>{
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
                                {userData?.userRole === 'admin' || userData?.userRole === 'moder' ? <TableHead className="w-[100px]">Действие</TableHead> : null}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taskData?.taskStaff?.map((user)=>(
                                <TableRow key={taskData.taskStaff.length++} className={"border-gray-200"}>
                                    <TableCell className="font-medium py-4">{user.userName}</TableCell>
                                    <TableCell>{user.userPost}</TableCell>
                                    <TableCell>{user.userTaskPost || user.taskPost}</TableCell>
                                    {userData?.userRole === 'admin' || userData?.userRole === 'moder' ? 
                                    <TableCell className="w-[100px]">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Button variant="destructive">Снять с задачи</Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Вы действительно хотите отменить задачу для сотрудника?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Данная задача больше не будет доступна для {user.userName}
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Отменить</AlertDialogCancel>
                                                <AlertDialogAction onClick={()=>{removeUserFromTask(user.userId)}}>Снять с задачи</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell> : null}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {
                    userData?.userRole === 'admin' || userData?.userRole === 'moder' ?
                    <Button className={'mt-2'} onClick={()=>{setAlertAddUserToTask(true)}}>Добавить сотрудника</Button> : null
                }
            </div>
            <div className="mb-4">
                <h3 className="font-medium mb-2">Отчет по работе:</h3>
                <div className="w-2/3 border border-gray-200 rounded-md">
                    {taskData?.formattedReports?.map((report)=>(
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
            <AlertDialog open={alertAddUserToTask} onOpenChange={setAlertAddUserToTask}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Добавление сотрудника</AlertDialogTitle>
                    <div className="mb-2">
                        <Label className={'mb-2'}>Сотрудники</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                            onClick={()=>{getStaff()}}
                            >ФИО
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0 bg-white">
                            <Command>
                            <CommandInput placeholder="Поиск сотрудника" />
                            <CommandList>
                                {!staff || staffIsLoading ? <CommandEmpty>Загрузка..</CommandEmpty> : <CommandEmpty>Сотрудник не найден</CommandEmpty>}
                                <CommandGroup>
                                {staff.map((user) => (
                                    <CommandItem
                                    key={user.userId}
                                    onSelect={() => {
                                        toggleItem(user)
                                    }}
                                    >
                                    {user.userName} - {user.userPost}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        {addedUser.map((user)=>(
                            <div key={user.userId} className="flex items-start mt-2">
                            <Checkbox 
                                id={user.userId} 
                                defaultChecked
                                checked={addedUser.some(selected => selected.userId === user.userId)}
                                onCheckedChange={() => toggleItem(user)}
                            />
                            <div className="ml-2">
                                <Label htmlFor={user.userId}>{user.userName}</Label>
                                <p className="text-muted-foreground text-sm">
                                {user.userPost}
                                </p>
                            </div>
                            <Input 
                                value={user.taskPost}
                                onChange={(e) => handlePostChange(user.userId, e.target.value)}
                                required className={'w-max ml-6'} 
                                placeholder='Должность в проекте'/>
                            </div>
                        ))}
                    </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={()=>{setAlertAddUserToTask(false)}}>Закрыть</AlertDialogCancel>
                        <AlertDialogAction disabled={addedUser != 0 ? false : true} onClick={()=>{addUserToTask()}}>Добавить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
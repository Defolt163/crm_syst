'use client'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { useData } from "../DataContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { InfoIcon, Pencil } from "lucide-react"
//import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Spinner } from "@radix-ui/themes"
import { useRouter } from "next/navigation"
const crypto = require('crypto');


export default function StaffTable(props){
    const router = useRouter()

    const { userData } = useData()
    const [staff, setStaff] = useState([])
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    useEffect(()=>{
        const token = getCookie('token')
        fetch('/api/staff-list',
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
            setStaff(result)
        })
    },[])

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserRole, setSelectedUserRole] = useState('user')
    const [selectedUserTasks, setSelectedUserTasks] = useState([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const tasksSuccess = selectedUserTasks.filter(task => task.taskStatus === 'success');
    const tasksInWork = selectedUserTasks.filter(task => task.taskStatus === 'inWork' || task.taskStatus === 'created');
    function openSheet(userId){
        const token = getCookie('token');
        fetch(`/api/staff-list`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: userId,
            })
        }).then((res)=>{
            return res.json()
        }).then((result)=>{
            console.log("result", result)
            setSelectedUserTasks(result.taskRow)
        }).catch((err)=>{
            console.log(err)
        })
        const user = staff.find(u => u.userId === userId);
        setSelectedUser(user);
        setSelectedUserRole(user.userRole)
        setIsSheetOpen(true);
    }

    const [newPassword, setNewPassword] = useState({})
    const [alertDialog, setAlertDialog] = useState(false)
    //const [userLogin, setUser] = useState(null)
    async function decryptData(encodedMessage, messageIv, userLogin) {
        // Преобразуем ключ и IV из шестнадцатеричного формата
        const key = Buffer.from('16cf126a9dc4e39e405a03ad0fb2f31d91f6b73342c7d7647772e104aa8d7e39', 'hex'); // Ключ AES-256
        const iv = Buffer.from(messageIv, 'hex'); // IV (инициализационный вектор)
        // Преобразуем зашифрованные данные в Buffer
        const encryptedBuffer = Buffer.from(encodedMessage, 'hex');

        // Создаем расшифровщик
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

        // Расшифровка данных
        let decrypted = decipher.update(encryptedBuffer, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        let parsedData = JSON.parse(decrypted)
        setNewPassword({login: userLogin, password: parsedData})
        setAlertDialog(true)
    }
    async function resetAccount(userId){
        const token = getCookie('token');
        await fetch(`/api/reset-account`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: userId,
            })
        }).then((res)=>{
            return res.json()
        }).then((result)=>{
            decryptData(result.password.encryptedData, result.password.iv, result.userLogin)
        }).catch((err)=>{
            console.log(err)
        })
    }
    async function giveRole(status, checkedRole, userId){
        const newRole = status ? checkedRole : 'user';
    
        // 1. Обновляем роль в массиве staff
        setStaff(prevStaff => prevStaff.map(u => 
            u.userId === userId ? {...u, userRole: newRole} : u
        ));
        
        // 2. Обновляем selectedUser и selectedUserRole
        setSelectedUser(prev => ({...prev, userRole: newRole}));
        setSelectedUserRole(newRole);
        const token = getCookie('token');
        await fetch(`/api/give-role`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userRole: newRole,
                userId: userId,
            })
        }).then((res)=>{
            if(res.ok){
                toast.success(`Права пользователя ${selectedUser.userName} обновлены на: ${status ? checkedRole : 'user'}`)
            }if(res.status == 401){
                toast.warning(`Недостаточно прав`)
            }
        }).catch((err)=>{
            toast.error("Ошибка сервера")
        })
    }
    const [alertRemoveUserDialog, setAlertRemoveUserDialog] = useState(false)
    function deleteUserDialogAlert(userId){
        const user = staff.find(u => u.userId === userId);
        setSelectedUser(user);
        setAlertRemoveUserDialog(true);
    }
    async function deleteAccount(userId){
        const token = getCookie('token');
        await fetch(`/api/delete-account`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: userId,
            })
        }).then((res)=>{
            if(res.ok){
                setStaff(staff.filter(user => user.userId !== userId));
                setAlertRemoveUserDialog(false)
                toast.success(`Пользователь успешно удален`)
            }
        }).catch((err)=>{
            toast.error(`Ошибка сервера`)
        })
    }
    const [newUserName, setNewUserName] = useState('')
    const [newUserPost, setNewUserPost] = useState('')
    const [newUserPhone, setNewUserPhone] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')
    useEffect(()=>{
        setNewUserName(selectedUser?.userName)
        setNewUserPost(selectedUser?.userPost)
        setNewUserPhone(selectedUser?.userPhone)
        setNewUserEmail(selectedUser?.userEmail)
        console.log(selectedUser)
    }, [selectedUser])
    const [buttonLoading, setButtonLoading] = useState(false)
    async function updateUserInfo(userId, updateField, newDataField){
        const token = getCookie('token')
        setButtonLoading(true)
        try{
            const response = await fetch('/api/user-edit',
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userId: userId,
                        updateField: updateField,
                        newDataField: newDataField
                    })
                }
            )
            if(!response.ok){
                toast.error(`Ошибка обновления`)
                setButtonLoading(false)
            }
            else if(updateField == 'userName'){
                setSelectedUser(prev => ({...prev, userName: newDataField}));
                setStaff(prevStaff => prevStaff.map(u => 
                    u.userId === userId ? {...u, userName: newDataField} : u
                ));
            }
            else if(updateField == 'userPhone'){
                setSelectedUser(prev => ({...prev, userPhone: newDataField}));
                setStaff(prevStaff => prevStaff.map(u => 
                    u.userId === userId ? {...u, userPhone: newDataField} : u
                ));
            }
            else if(updateField == 'userEmail'){
                setSelectedUser(prev => ({...prev, userEmail: newDataField}));
                setStaff(prevStaff => prevStaff.map(u => 
                    u.userId === userId ? {...u, userEmail: newDataField} : u
                ));
            }
            else if(updateField == 'userPost'){
                setSelectedUser(prev => ({...prev, userPost: newDataField}));
                setStaff(prevStaff => prevStaff.map(u => 
                    u.userId === userId ? {...u, userPost: newDataField} : u
                ));
            }
            setButtonLoading(false)
            toast.success(`Данные пользователя успешно обновлены`)
        }
        catch{
            toast.error(`Ошибка сервера`)
        }
    }
    async function removeUserFromTask(taskId, userId){
        const token = getCookie('token')
        setButtonLoading(true)
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
                        taskId: taskId,
                    })
                }
            )
            if(!response.ok){
                toast.error(`Ошибка снятия с задачи`)
                setButtonLoading(false)
            }
            setButtonLoading(false)
            toast.success(`Сотрудник снят с задачи`)
        }
        catch{
            toast.error(`Ошибка сервера`)
        }
    }
    return(
        <div className={`rounded-md border border-gray-200 ${props.width}`}>
            <Table>
                    <TableHeader>
                        <TableRow className={"border-gray-200 text-gray-700"}>
                        <TableHead className="w-[100px]">ФИО</TableHead>
                        <TableHead>Должность</TableHead>
                        <TableHead>Выполненные задачи</TableHead>
                        <TableHead>Активные задачи</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Email</TableHead>
                        {userData?.userRole === 'admin' || userData?.userRole === 'moder' ? <TableHead>Действие</TableHead> : null}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff?.map((user)=>(
                            <TableRow key={staff.length++} className={"border-gray-200"}>
                                <TableCell className="font-medium py-4">{user.userName}</TableCell>
                                <TableCell>{user.userPost}</TableCell>
                                <TableCell>{user.completed_tasks}</TableCell>
                                <TableCell>{user.active_tasks}</TableCell>
                                <TableCell>{user.userPhone}</TableCell>
                                <TableCell>{user.userEmail}</TableCell>
                                {userData?.userRole === 'admin' || userData?.userRole === 'moder' ? 
                                <TableCell className={"text-2xl leading-[0] flex cursor-pointer py-4"}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            ...
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className={'bg-white p-2'}>
                                            <DropdownMenuLabel>Действие</DropdownMenuLabel>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem><h3 onClick={()=>{openSheet(user.userId)}}>Открыть</h3></DropdownMenuItem>
                                                <DropdownMenuItem><h3 onClick={()=>{deleteUserDialogAlert(user.userId)}}>Удалить</h3></DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell> : null}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
            <Sheet open={isSheetOpen}>
                <SheetContent className="sheet_staff">
                    <SheetHeader>
                        <SheetTitle>Пользователь: {selectedUser?.userId}</SheetTitle>
                        <SheetDescription>Информация о пользователе</SheetDescription>
                    </SheetHeader>
                    <div className="px-4">
                        <h3 className="relative z-[4] font-semibold text-black text-lg mb-4 flex items-center">{selectedUser?.userName} {userData?.userRole === 'admin' ? 
                        <Popover>
                            <PopoverTrigger asChild><Pencil className="w-[15px] cursor-pointer ml-2 text-gray-400"/></PopoverTrigger>
                            <PopoverContent sideOffset={5} align='end'>
                                <div className="bg-white p-4 shadow-[0_0_35px_rgba(0,0,0,0.35)] rounded-md z-[999]">
                                    <p className="text-muted-foreground text-sm">Редактирование</p>
                                    <Spinner/>
                                    <Input
                                        className="col-span-2 h-8 my-2"
                                        value={newUserName}
                                        onChange={(e)=>{setNewUserName(e.target.value)}}
                                    />
                                    <Button disabled={!buttonLoading ? false : true} onClick={()=>{updateUserInfo(selectedUser?.userId, 'userName', newUserName)}}>{!buttonLoading ? 'Сохранить' :<span className="loader"></span>}</Button>
                                </div>
                            </PopoverContent>
                        </Popover> : null}</h3>
                        <h3 className="relative z-[3] font-semibold text-gray-900 text-base mb-2 flex items-center">Должность: {selectedUser?.userPost} {userData?.userRole === 'admin' ? <Popover>
                            <PopoverTrigger asChild><Pencil className="w-[15px] cursor-pointer ml-2 text-gray-400"/></PopoverTrigger>
                            <PopoverContent sideOffset={5} align='end'>
                                <div className="bg-white p-4 shadow-[0_0_35px_rgba(0,0,0,0.35)] rounded-md z-[999]">
                                    <p className="text-muted-foreground text-sm">Редактирование</p>
                                    <Input
                                        value={newUserPost}
                                        onChange={(e)=>{setNewUserPost(e.target.value)}}
                                        className="col-span-2 h-8 my-2"
                                    />
                                    <Button disabled={!buttonLoading ? false : true} onClick={()=>{updateUserInfo(selectedUser?.userId, 'userPost', newUserPost)}}>{!buttonLoading ? 'Сохранить' :<span className="loader"></span>}</Button>
                                </div>
                            </PopoverContent>
                        </Popover> : null}</h3>
                        <h3 className="relative z-[2] font-semibold text-gray-900 text-base mb-2 flex items-center">Телефон: {selectedUser?.userPhone} {userData?.userRole === 'admin' ? <Popover>
                            <PopoverTrigger asChild><Pencil className="w-[15px] cursor-pointer ml-2 text-gray-400"/></PopoverTrigger>
                            <PopoverContent sideOffset={5} align='end'>
                                <div className="bg-white p-4 shadow-[0_0_35px_rgba(0,0,0,0.35)] rounded-md z-[999]">
                                    <p className="text-muted-foreground text-sm">Редактирование</p>
                                    <Input
                                        value={newUserPhone}
                                        onChange={(e)=>{setNewUserPhone(e.target.value)}}
                                        className="col-span-2 h-8 my-2"
                                        type='number'
                                    />
                                    <Button disabled={!buttonLoading ? false : true} onClick={()=>{updateUserInfo(selectedUser?.userId, 'userPhone', newUserPhone)}}>{!buttonLoading ? 'Сохранить' :<span className="loader"></span>}</Button>
                                </div>
                            </PopoverContent>
                        </Popover> : null}</h3>
                        <h3 className="relative z-[1] font-semibold text-gray-900 text-base mb-2 flex items-center">Email: {selectedUser?.userEmail} {userData?.userRole === 'admin' ? <Popover>
                            <PopoverTrigger asChild><Pencil className="w-[15px] cursor-pointer ml-2 text-gray-400"/></PopoverTrigger>
                            <PopoverContent sideOffset={5} align='end'>
                                <div className="bg-white p-4 shadow-[0_0_35px_rgba(0,0,0,0.35)] rounded-md z-[999]">
                                    <p className="text-muted-foreground text-sm">Редактирование</p>
                                    <Input
                                        value={newUserEmail}
                                        onChange={(e)=>{setNewUserEmail(e.target.value)}}
                                        className="col-span-2 h-8 my-2"
                                        type='email'
                                    />
                                    <Button disabled={!buttonLoading ? false : true} onClick={()=>{updateUserInfo(selectedUser?.userId, 'userEmail', newUserEmail)}}>{!buttonLoading ? 'Сохранить' :<span className="loader"></span>}</Button>
                                </div>
                            </PopoverContent>
                        </Popover> : null}</h3>
                        {userData?.userRole === 'admin' ? 
                            <>
                                <h3 className="flex items-center font-semibold text-gray-900 text-base mb-2">
                                    <div className="
                                            staff_info_icon
                                            admin
                                            "
                                        >
                                        <InfoIcon/>
                                    </div>
                                    Доступ администратора: <Switch
                                    className={'ml-2'}
                                    checked={selectedUserRole === 'admin'}
                                    onCheckedChange={(checked) => {
                                            giveRole(checked, "admin", selectedUser?.userId);
                                        }}
                                    />
                                </h3>
                                <h3 className="flex items-center font-semibold text-gray-900 text-base mb-2">
                                    <div className="
                                            staff_info_icon
                                            moderator
                                            ">
                                        <InfoIcon/>
                                    </div>
                                    Доступ модератора: <Switch
                                    className={'ml-2'}
                                    checked={selectedUserRole === 'moder'}
                                    onCheckedChange={(checked) => {
                                            giveRole(checked, "moder", selectedUser?.userId);
                                        }}
                                    />
                                </h3>
                            </> : null
                        }
                        <h3 className="font-semibold text-gray-900 text-base mb-2">Кол-во активных задач: {selectedUser?.active_tasks}</h3>
                        {tasksInWork?.length != 0 ?
                            (
                                <Table>
                                    <TableHeader>
                                        <TableRow className={"border-gray-200 text-gray-700"}>
                                            <TableHead className="w-[100px]">Задача</TableHead>
                                            <TableHead className="w-[100px]">Описание</TableHead>
                                            <TableHead className="w-[100px]">Действие</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasksInWork?.map((task)=>(
                                            <TableRow key={task.taskId} className={"border-gray-200 text-gray-700"}>
                                                <TableCell className="w-[100px]">{task.taskId}</TableCell>
                                                <TableCell className="w-[100px]">{task.taskDescr}</TableCell>
                                                <TableCell className="w-[100px]">
                                                    <Popover>
                                                        <PopoverTrigger><Button>...</Button></PopoverTrigger>
                                                        <PopoverContent className="flex flex-col bg-white p-2 shadow-[0_0_35px_rgba(0,0,0,0.35)] rounded-md z-[999]">
                                                            <Button className={'mb-2'} onClick={()=>{router.push(`/dashboard/tasks/${task.taskId}`)}}>Открыть</Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild><Button variant="destructive">Снять с задачи</Button></AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                    <AlertDialogTitle>Вы действительно хотите отменить задачу для сотрудника?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Данная задача больше не будет доступна для {selectedUser?.userName}
                                                                    </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                    <AlertDialogCancel>Отменить</AlertDialogCancel>
                                                                    <AlertDialogAction asChild><Button variant="destructive" onClick={()=>{removeUserFromTask(task.taskId, selectedUser?.userId)}}>Снять с задачи</Button></AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : null
                        }
                        <h3 className="font-semibold text-gray-900 text-base">Работал над проектами: {selectedUser?.completed_tasks}</h3>
                        {tasksSuccess?.length != 0 ?
                            (
                                <Table>
                                    <TableHeader>
                                        <TableRow className={"border-gray-200 text-gray-700"}>
                                            <TableHead className="w-[100px]">Задача</TableHead>
                                            <TableHead className="w-[100px]">Описание</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasksSuccess?.map((task)=>(
                                            <TableRow key={task.taskId} className={"border-gray-200 text-gray-700"}>
                                                <TableCell className="w-[100px]">{task.taskId}</TableCell>
                                                <TableCell className="w-[100px]">{task.taskDescr}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : null
                        }
                        
                    </div>
                    <SheetFooter>
                        {userData?.userRole === 'admin' ? <Button onClick={()=>{resetAccount(selectedUser?.userId)}}>Восстановить аккаунт</Button> : null}
                        <SheetClose asChild>
                            <Button onClick={()=>{setIsSheetOpen(false)}}>Закрыть</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <AlertDialog open={alertDialog} onOpenChange={setAlertDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Новые данные аккаунта</AlertDialogTitle>
                    <AlertDialogDescription>
                        Пароль обновлен
                    </AlertDialogDescription>
                    <div>
                        <h2>Логин: <strong>{newPassword.login}</strong></h2>
                        <h2>Пароль: <strong>{newPassword.password}</strong></h2>
                    </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={()=>{setAlertDialog(false)}}>Закрыть</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={alertRemoveUserDialog} onOpenChange={setAlertRemoveUserDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Вы действительно хотите удалить сотрудника?</AlertDialogTitle>
                    <div>
                        <h3 className="font-semibold text-black text-base mb-2">{selectedUser?.userName}</h3>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2">Должность: {selectedUser?.userPost}</h3>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2">Телефон: {selectedUser?.userPhone}</h3>
                        <h3 className="font-semibold text-gray-900 text-sm mb-2">Email: {selectedUser?.userEmail}</h3>
                    </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant="destructive" onClick={()=>{deleteAccount(selectedUser?.userId)}}>Удалить</Button>
                        <AlertDialogCancel onClick={()=>{setAlertDialog(false)}}>Закрыть</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
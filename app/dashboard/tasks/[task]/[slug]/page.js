'use client'
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PagesHeader from "@/app/components/PagesHeader/PagesHeader";
import { use, useEffect, useState } from "react";
import SkeletonPage from "@/app/components/SkeletonPage/SkeletonPage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useSocket from "@/app/components/useSocket";
import { useData } from "@/app/components/DataContext";

export default function EditTaskPartPage({ params }) {
    const { userData } = useData()
    const router = useRouter()
    const unwrappedParams = use(params);
    const taskId = unwrappedParams.task;
    const partId = unwrappedParams.slug;
    const [partInfo, setPartInfo] = useState([])
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    const [accessDenied, setAccessDenied] = useState(false);
    async function getSlugData(){
        const token = getCookie('token');
        try{
            const response = await fetch('/api/task-data/task-part',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    taskId: taskId,
                    partId: partId
                })
            })
            if (response.status === 200) {
                const res = await response.json();
                setPartInfo(res)
            } else {
                setAccessDenied(true);
            }
        }catch (err){
            console.log(err)
        }
        /* fetch('/api/task-data/task-part',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    taskId: taskId,
                    partId: partId
                })
            }
        ).then((res)=>{
            return res.json()
        }).then((result)=>{
            setPartInfo(result)
            console.log(result)
        }).catch((err)=>{
            console.log(err)
        }) */
    }
    useEffect(()=>{
        getSlugData()
    }, [])

    const [status, setStatus] = useState('')
    const items = [
        {
            id: "В работе",
            label: "В работе",
        },
        {
            id: "На утверждении",
            label: "На утверждении",
        },
        {
            id: "Выполнен",
            label: "Выполнен",
        }
    ]

    const [selectedUsers, setSelectedUsers] = useState([]);

    // Инициализация при загрузке данных
    useEffect(() => {
        if (partInfo.partInfoStaff?.length && partInfo.userId) {
        const defaultSelected = partInfo.partInfoStaff
            .filter(user => user.user_id == partInfo.userId)
            .map(user => user.user_id);
        setSelectedUsers(defaultSelected);
        }
    }, [partInfo]);
    const handleUserToggle = (userId) => {
        setSelectedUsers(prev => 
        prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
        );
    };
    const socketRef = useSocket(); // подключение
    const socket = socketRef.current;
    useEffect(() => {

        if (!socket || !userData) return;

        return () => {
            socket.off("taskCreate");
        };
    }, [userData]);
    async function postPartData(e){
        e.preventDefault()
        const formData = new FormData(e.target)
        const token = getCookie('token');
        fetch('/api/task-data/task-part/task-part-report',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    taskId: taskId,
                    partId: partId,
                    status: status || "inWork",
                    selectedStaff: selectedUsers,
                    partResult: formData.get('resultTextarea')
                })
            }
        ).then(()=>{
            socket.emit("taskReport", taskId, userData.userName, partInfo.partInfo[0].part_name)
            toast.success("Отчет добавлен!")
            router.push(`/dashboard/tasks/${taskId}`)
        }).catch(()=>{
            toast.error("Ошибка сервера")
        })
    }
    useEffect(()=>{
        console.log(status, selectedUsers)
    }, [status, selectedUsers])


    if(accessDenied){
        return(
            <div>
                <h2 className="text-2xl text-red-700 font-semibold">Редактирование запрещено</h2>
                <h2 className="text-xl text-gray-700 font-semibold">Вносить отчеты могут только сотрудники задчи</h2>
                <Button onClick={()=>{router.push(`/dashboard/tasks/${taskId}`)}}>Вернуться</Button>
            </div>
        )
    }
    if(partInfo.length == 0){
        return(
            <SkeletonPage/>
        )
    }
    return (
        <>
            <PagesHeader header={`Задача ${partInfo.partInfo[0].part_id}`} subheader={<span className="text-black"><strong>Отчет по этапу:</strong> {partInfo.partInfo[0].part_name} <br/> <strong>Планируемый результат:</strong> {partInfo.partInfo[0].result}</span>}/>
            <form onSubmit={(e)=>postPartData(e)}>
                <div>
                    <h2 className='mb-2 text-sm font-medium'>Статус</h2>
                    <Select required name="status" value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-max border-gray-200">
                            <SelectValue className={'ml-1'} placeholder='Выберите из списка'></SelectValue>
                        </SelectTrigger>
                        <SelectContent className={'bg-white border-gray-200 p-2'}>
                            {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="my-4">
                    <h2 className='mb-2 text-sm font-medium'>Сотрудники</h2>
                    {partInfo.partInfoStaff.map((user)=>(
                        <div key={user.user_id} className="flex mb-2">
                            <Checkbox id={user.user_id} checked={selectedUsers.includes(user.user_id)} onCheckedChange={() => handleUserToggle(user.user_id)}/>
                            <Label className={'ml-2'} htmlFor={user.user_id}>{user.name} - {user.position}</Label>
                        </div>
                    ))}
                </div>
                <div className="w-2/4">
                    <Label className={'mb-2'} htmlFor={'resultTextarea'}>Описание</Label>
                    <Textarea required id='resultTextarea' name='resultTextarea' placeholder='Ход работы, итоги'/>
                </div>
                <Button className={'mt-4 cursor-pointer'}>Сохранить</Button>
            </form>
        </>
    );
}

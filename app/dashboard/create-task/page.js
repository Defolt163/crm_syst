'use client'
import { Label } from "@/components/ui/label";
import PagesHeader from "../../components/PagesHeader/PagesHeader";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Calendar23 from "@/components/calendar-23";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useData } from "@/app/components/DataContext";
import useSocket from "@/app/components/useSocket";
import { registerPassengerHandlers } from "@/app/components/socketHandlers";

export default function CreateTaskPage() {
  const { userData } = useData()
  const socketRef = useSocket(); // подключение
  const socket = socketRef.current;
  useEffect(() => {

    if (!socket || !userData) return;

    return () => {
      socket.off("taskCreate");
    };
  }, [userData]);

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
          console.log(result)
          setStaff(result)
      })
  },[])

  function submitForm(e){
    e.preventDefault()
    const formData = new FormData(e.target)
    const token = getCookie('token');
    fetch('/api/new-task',
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                  taskDescr: formData.get('taskDescription'),
                  taskGlobalResult: formData.get('taskResult'),
                  addedUser: addedUser,
                  taskParts: addedTaskPart,
              }),
          }
      ).then((res)=>{
        if(res.status == 200){
          socket.emit("taskCreate", addedUser.map((user)=>(user.userId)))
          toast.success("Задача создана")
        }else if(res.status == 401){
          toast.warning("Проверьте, все ли поля были заполнены",{
          description: "Возможно, вы забыли заполнить дату этапа"})
        }
      }).catch(()=>{
        toast.error("Ошибка сервера")
      })
  }
  const [addedUser, setAddedUser] = useState([])

  const toggleItem = (user) => {
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
          taskPost: "" // дефолтное значение
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
  const [open, setOpen] = useState(false)

  const [addedTaskPart, setAddedTaskPart] = useState([
    { id: 0, 
      name: '', 
      result: '',
      dateRange: {
        from: null, // { day, month, year }
        to: null    // { day, month, year }
      } 
    }])

  const handleNameChange = (partIndex, newName) => {
    setAddedTaskPart(prevParts => 
      prevParts.map((part, index) => 
        index === partIndex ? { ...part, name: newName } : part
      )
    );
  };
  const handleResultChange = (partIndex, newResult) => {
    setAddedTaskPart(prevParts => 
      prevParts.map((part, index) => 
        index === partIndex ? { ...part, result: newResult } : part
      )
    );
  };

  const addPart = () => {
    setAddedTaskPart(prevParts => [
      ...prevParts,
      { id: prevParts.length, name: '', result: '', } // Используем длину массива как id
    ]);
  };

  const removePart = (id) => {
    setAddedTaskPart(prevParts => prevParts.filter(part => part.id !== id));
  };


  const [dateRange, setDateRange] = useState(null);
  const formatDatePart = (date) => {
    if (!date) return null; // Защита от null/undefined
    
    return [
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear()
    ];
  };

  const handleDateChange = (partId, range) => {
    setAddedTaskPart(prev => prev.map(part => {
      if (part.id !== partId) return part;
      
      return {
        ...part,
        dateRange: {
          from: range?.from ? formatDatePart(range.from) : null,
          to: range?.to ? formatDatePart(range.to) : null
        }
      };
    }));
  };

  useEffect(()=>{
    console.log("userData", userData)
  },[userData])
  if(!userData){
      return(
          <h2 className="text-2xl font-semibold">Загрузка</h2>
      )
  }
  if(userData && userData.userRole !== 'admin' && userData.userRole !== 'moder'){
      return(
        <h2 className="text-2xl text-red-700 font-semibold">Доступ воспрещен!</h2>
      )
  }
  return (
    <>
        <PagesHeader header={"Создание задачи"}/>
        <form onSubmit={(e)=>submitForm(e)} className="w-2/4">
          <div className="mb-4">
            <Label className={'mb-2'} htmlFor='taskDescription'>Описание задачи</Label>
            <Textarea required id='taskDescription' name="taskDescription"/>
          </div>
          <div className="mb-4">
            <Label className={'mb-2'} htmlFor='taskResult'>Ожидаемый результат</Label>
            <Textarea required id='taskResult' name='taskResult'/>
          </div>
          <div className="mb-4">
            <Label className={'mb-2'}>Сотрудники</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between"
                >ФИО
                  <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 bg-white">
                <Command>
                  <CommandInput placeholder="Поиск сотрудника" />
                  <CommandList>
                    {!staff ? <CommandEmpty>Загрузка..</CommandEmpty> : <CommandEmpty>Сотрудник не найден</CommandEmpty>}
                    <CommandGroup>
                      {staff.map((user) => (
                        <CommandItem
                          key={user.userId}
                          onSelect={() => {
                            toggleItem(user)
                          }}
                        >
                          {/* <CheckIcon
                            className={(
                              "mr-2 h-4 w-4",
                              value === user.value ? "opacity-100" : "opacity-0"
                            )}
                          /> */}
                          {user.userName} - {user.userPost}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="mt-4">
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
          </div>
          <div>
            <Label className={'mb-2'}>Этапы</Label>
            {addedTaskPart?.map((part)=>(
              <div key={part.id}>
                <div className="flex mb-4 items-center">
                  <Input required className={'w-max mr-4'} placeholder='Название этапа' value={part.name} onChange={(e) => handleNameChange(part.id, e.target.value)}/>
                  <Calendar23 
                    value={part.dateRange}
                    onDateChange={(range) => handleDateChange(part.id, range)}
                  />
                  {addedTaskPart.length >= 2 ? <Trash2 className="ml-2 cursor-pointer" onClick={()=>{removePart(part.id)}}/> : null}
                </div>
                <Textarea className={'w-full mb-4 mr-4'} placeholder='Задача этапа' value={part.result} onChange={(e) => handleResultChange(part.id, e.target.value)}/>
              </div>
            ))}
          </div>
          <Button type="button" className={'bg-black text-white'} onClick={()=>{addPart()}}>Добавить этап</Button>
          <Button type='submit' name="action" className={'bg-black text-white mt-6 block'}>Разместить задачу</Button>
        </form>
    </>
  );
}

'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useData } from "../DataContext";

export default function NewUserForm(){
    const { userData } = useData()
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    async function postUser(e){
        e.preventDefault()
        const formData = new FormData(e.target)
        const token = getCookie('token');
        await fetch('/api/new-user',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userName: formData.get('fio'),
                    userPost: formData.get('post'),
                    userPhone: formData.get('phone'),
                    userEmail: formData.get('email'),
                    userLogin: formData.get('login'),
                    userPassword: formData.get('password'),
                })
            }
        ).then((res)=>{
            if(res.status == 500){
                toast.error("Ошибка регистрации", {
                    description: "Ошибка сервера"
                })
            }
            else if(res.status == 400){
                toast.warning("Ошибка регистрации", {
                    description: "Такой пользователь уже существует"
                })
            }
            else if(res.status == 201){
                toast.success("Пользователь успешно зарегистрирован")
            }
        })
    }
    if(!userData){
      return(
          <h2 className="text-2xl font-semibold">Загрузка</h2>
      )
    }
    if(userData?.userRole !== 'admin'){
        return(
            <h2 className="text-2xl text-red-700 font-semibold">Доступ воспрещен!</h2>
        )
    }
    return(
        <form onSubmit={(e) => postUser(e)}>
            <div className="grid w-full max-w-sm items-center gap-3 mb-6">
                <Label htmlFor="fio">ФИО</Label>
                <Input name="fio" required type="text" id="fio" placeholder="Иванов Иван Иванович" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-3 mb-6">
                <Label htmlFor="post">Должность</Label>
                <Input required type="text" id="post" name="post" placeholder="Наименование должности" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-3 mb-6">
                <Label htmlFor="phone">Телефон</Label>
                <Input required type="number" id="phone" name="phone" placeholder="+7 999 999 99 99" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-3 mb-6">
                <Label htmlFor="email">Email</Label>
                <Input required type="email" id="email" name="email" placeholder="example@example.ru" />
            </div>
            <div className="grid w-full max-w-sm items-center gap-3 mb-6">
                <Label htmlFor="login">Логин</Label>
                <Input required type="text" id="login" name="login" placeholder="Логин" />
                <p className="text-gray-500 text-sm leading-[0]">
                    Логин для авторизации сотрудника в личный кабинет
                </p>
            </div>
            <div className="grid w-full max-w-sm items-center gap-3 mb-6">
                <Label htmlFor="password">Пароль</Label>
                <Input required type="text" id="password" name="password" />
                <p className="text-gray-500 text-sm leading-[0]">
                    Пароль для авторизации сотрудника в личный кабинет
                </p>
            </div>
            <Button>Создать учетную запись</Button>
        </form>
    )
}
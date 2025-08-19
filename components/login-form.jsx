'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}) {
  const router = useRouter()
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const expiresStr = "expires=" + expires.toUTCString();
    document.cookie = `${name}=${value}; ${expiresStr}; path=/`;
  }
  async function sendAuth(e){
    e.preventDefault()
    const formData = new FormData(e.target)
    try{
      let response = await fetch('/api/login',
        {
          method: 'POST',
          body: JSON.stringify({
              userLogin: formData.get('login'),
              userPassword: formData.get('password'),
          }),
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      if(response.status === 200){
        const data = await response.json();
        setCookie('token', data.token, 7);
        toast.success("Вы успешно вошли")
        router.push('/dashboard')
      }
      else if(response.status == 400 || response.status == 404){
        toast.warning("Неверный логин или пароль")
      }
      else if(response.status == 500){
        toast.error("Ошибка авторизации", {
            description: "Ошибка сервера"
        })
      }
    } catch (err){
      console.log(err)
      toast.error("Ошибка авторизации", {
          description: "Ошибка сервера"
      })
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>
            Введите данные, которые вам выдал администратор
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => sendAuth(e)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="login">Логин</Label>
                <Input name="login" id="login" type="text" placeholder="m@example.com" required />
              </div>
              <div className="grid gap-3">
                  <Label htmlFor="password">Пароль</Label>
                  <Input name="password" id="password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Авторизация
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

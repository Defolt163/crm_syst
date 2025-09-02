"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
    const router = useRouter()
    const userPath = usePathname()
    const [userData, setUserData] = useState(null);
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        const expiresStr = "expires=" + expires.toUTCString();
        document.cookie = `${name}=${value}; ${expiresStr}; path=/`;
    }
    // Функция для получения данных о пользователе
    async function fetchUserData() {
        const token = getCookie('token'); // Получаем токен из куки
    
        return await fetch('/api/login', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        .then((response) => {
            if (!response.ok) { 
                if (userPath.startsWith('/dashboard')) {
                    if (response.status === 401) {
                        router.push('/');
                    }
                }
                setCookie('token', 'notAuth', 7)
            }
            else{
                return response.json()
            }
        }).then((res)=>{
            if(res){
                //console.log("22", res)
                setCookie('token', res.newToken, 7)
                setUserData({...res.rows[0], tasksData: res.tasksData})
            }
        })
        .catch((error) => {
            console.error('Fetch error:', error);
        });
    }
    useEffect(()=>{
        fetchUserData()
    },[])


    // Специальная функция для увеличения счетчика уведомлений
    const incrementNotificationCount = () => {
        setUserData(prev => ({
        ...prev,
        userNotificationCount: (prev?.userNotificationCount || 0) + 1
        }));
    };

    const resetNotificationCount = () => {
        console.log("RESS")
        setUserData(prev => ({
        ...prev,
        userNotificationCount: 0
        }));
    };

    return (
        <DataContext.Provider value={{ userData, incrementNotificationCount, resetNotificationCount }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}

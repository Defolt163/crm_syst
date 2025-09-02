'use client'
import { Suspense, useEffect, useState } from "react";
import PagesHeader from "../../components/PagesHeader/PagesHeader";
import TableSearchBlock from "../../components/TableSearchBlock/TableSearchBlock";
import TableTasks from "../../components/TableTasks/TableTasks";
import { useData } from "@/app/components/DataContext";

export default function ActiveTaskPage(){
    const { userData, resetNotificationCount } = useData()
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedType, setSelectedType] = useState("myTasks")
    const [searchTable, setSearchTable] = useState("");
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    useEffect(()=>{
        if(userData && userData.userNotificationCount != 0){
            const token = getCookie('token');
            fetch('/api/user-update-notification/clear-notification',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            ).then(()=>{
                resetNotificationCount()
            }).catch((err)=>{
                console.log(err)
            })
        }
    }, [userData])
    return(
        <div>
            <PagesHeader header={"Задачи"} subheader={"Активные задачи"}/>
            <Suspense fallback={<div>Загрузка задач...</div>}>
                <TableSearchBlock selectedType={selectedType} setSelectedType={setSelectedType} selectedItems={selectedItems} setSelectedItems={setSelectedItems} searchTable={searchTable} setSearchTable={setSearchTable}/>
                <TableTasks selectedType={selectedType} selectedItems={selectedItems} searchTable={searchTable}/>
            </Suspense>
        </div>
    )
}
'use client'
import { useData } from "@/app/components/DataContext";
import PagesHeader from "../../components/PagesHeader/PagesHeader";
import ReportProgress from "../../components/ReportProgress/ReportProgress";
import ReportTable from "../../components/ReportTable/ReportTable";
import TableSearchBlock from "../../components/TableSearchBlock/TableSearchBlock";
import { useEffect, useState } from "react";

export default function ReportTaskPage(){
    const { userData } = useData()
    const [selectedItems, setSelectedItems] = useState([])
    const [searchTable, setSearchTable] = useState("");
    const [percentCloseOnTimeTasks, setPercentCloseOnTimeTasks] = useState(null);

    if(!userData){
        return(
            <h2 className="text-2xl font-semibold">Загрузка</h2>
        )
    }
    if(userData?.userRole !== 'admin' && userData?.userRole !== 'moder'){
        return(
            <h2 className="text-2xl text-red-700 font-semibold">Доступ воспрещен!</h2>
        )
    }
    return(
        <div>
            <PagesHeader header={"Отчет"} subheader={"Задержанные и в срок закрытые задачи"}/>
            <TableSearchBlock selectedItems={selectedItems} setSelectedItems={setSelectedItems} searchTable={searchTable} setSearchTable={setSearchTable}/>
            <ReportTable selectedItems={selectedItems} searchTable={searchTable} setPercentCloseOnTimeTasks={setPercentCloseOnTimeTasks}/>
            <ReportProgress percentProgress={percentCloseOnTimeTasks}/>
        </div>
    )
}
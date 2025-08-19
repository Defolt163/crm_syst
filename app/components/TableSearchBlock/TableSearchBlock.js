'use client'
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useData } from "../DataContext";

export default function TableSearchBlock({ selectedType = "myTasks", setSelectedType =()=>{}, selectedItems = [], setSelectedItems = () => {}, searchTable = "",
  setSearchTable = () => {} }){
    const { userData } = useData()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const itemsMain = [
        {
            id: "created",
            label: "Создан",
        },
        {
            id: "inWork",
            label: "В работе",
        },
        {
            id: "success",
            label: "Выполнен",
        }
    ]
    const itemsReport = [
        {
            id: 1,
            label: "В срок",
        },
        {
            id: 0,
            label: "Задержка",
        },
        {
            id: null,
            label: "В работе",
        }
    ]
    let itemsPageStatus = pathname == '/dashboard/report' ? itemsReport : itemsMain
    //let selectedItems = []
    
    //const [selectedItems, setSelectedItems] = useState([])
    
    const toggleItem = (item) => {
        setSelectedItems(prev => 
        prev.some(selected => selected.id === item.id)
            ? prev.filter(selected => selected.id !== item.id)
            : [...prev, item]
        );
    };

    const resetSelection = () => {
        setSelectedItems([]);
    };
    
    const handleValueChange = (value) => {
        setSelectedType(value);
    };
    useEffect(() => {
        if (searchParams.get('status') == 'history') {
            console.log("OK", selectedItems)
            toggleItem(itemsMain[2])
        }
    }, [searchParams])
    return(
        <div className="flex items-center mb-4">
            <Input 
                className={'w-max mr-2'} 
                placeholder="Поиск по описанию" 
                value={searchTable}
                onChange={(event) => setSearchTable(event.target.value)}
            />
            <Select>
                <div className="flex items-center">
                    <div className="flex pr-2 items-center border border-gray-200 rounded-md">
                        <SelectTrigger className="w-max border-none shadow-none">
                            <Label className={'ml-1'}><PlusCircle/> Статус</Label>
                        </SelectTrigger>
                        {
                            selectedItems.length > 0 ?
                            <div className="bg-gray-200 w-[1px] h-[25px]"></div> : null
                        }
                        {selectedItems.map((item)=>(
                            <div key={item.id} className="ml-2 bg-gray-200 rounded-md px-1 text-gray-700 cursor-pointer">{item.label}</div>
                        ))}
                    </div>
                    {selectedItems.length !== 0 ? <div className="ml-2 text-sm font-medium cursor-pointer flex items-center" onClick={()=>{resetSelection()}}>Сброс <X className="w-[20px]"></X></div> : null}
                </div>
                
                <SelectContent className={'bg-white border-gray-200 p-2'}>
                    {itemsPageStatus.map((item) => (
                        <div className="flex p-1" key={item.id} name={item.id}>
                            <Checkbox
                                id={item.id}
                                checked={selectedItems.some(selected => selected.id === item.id)}
                                onCheckedChange={() => toggleItem(item)}
                            />
                            <Label className={'ml-1'} htmlFor={item.id}>{item.label}</Label>
                        </div>
                    ))}
                </SelectContent>
            </Select>
            {pathname !== '/dashboard/report' && userData?.userRole === 'admin' || userData?.userRole === 'moder' ?
                <RadioGroup 
                    className={'ml-2 flex px-2 items-center border border-gray-200 rounded-md h-[36px]'} 
                    defaultValue="myTasks"
                    value={selectedType}
                    onValueChange={handleValueChange}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="myTasks" id="myTasks" />
                        <Label htmlFor="myTasks">Мои задачи</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="allTasks" id="allTasks" />
                        <Label htmlFor="allTasks">Все задачи</Label>
                    </div>
                </RadioGroup> : null
            }
            
        </div>
    )
}
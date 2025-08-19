'use client'
import { ChartRadialStacked } from "@/components/chart-radial-stacked"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { useData } from "../DataContext"
import { useEffect, useState } from "react"
import SkeletonPage from "../SkeletonPage/SkeletonPage"

export default function UserHello(){
    const { userData } = useData()
    const [dataUserHello, setDataUserHello] = useState()
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Если куки нет
    }
    const chartData = [{ badWorkTime: dataUserHello?.user_completed_late, goodWorkTime: dataUserHello?.user_completed_on_time }]
    const chartConfig = {
        badWorkTime: {
            label: "Задержек",
            color: "#B9583F",
        },
        goodWorkTime: {
            label: "В срок:",
            color: "#217E72",
        },
    }
    useEffect(()=>{
        const token = getCookie('token');
        fetch('/api/info-user-hello',
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
            setDataUserHello(result)
            console.log('result',result)
        }).catch((err)=>{
            console.log(err)
        })
    },[userData])
    if(!userData && !dataUserHello){
        return(<SkeletonPage/>)
    }
    return(
        <div>
            <h1 className="text-4xl font-bold mb-12">Здравствуйте, {userData?.userName}</h1>
            <div className="flex gap-4">
                <Card className="w-max">
                    <CardHeader className='w-[100%]'>
                        <CardDescription className="w-max">Кол-во Выполненных задач</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {dataUserHello?.user_completed_tasks}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card className="w-max">
                    <CardHeader className='w-[100%]'>
                        <CardDescription className="w-max">Кол-во Активных задач</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {dataUserHello?.user_active_tasks}
                        </CardTitle>
                    </CardHeader>
                </Card>
                {userData?.userRole === 'admin' || userData?.userRole === 'moder' ? (
                    <>
                        <Card className="w-max">
                            <CardHeader className='w-[100%]'>
                                <CardDescription className="w-max">Кол-во Всех задач</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {dataUserHello?.total_all_tasks}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="w-max">
                            <CardHeader className='w-[100%]'>
                                <CardDescription className="w-max">Кол-во Всех задач Завершенных в срок</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {dataUserHello?.all_completed_on_time}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card className="w-max">
                            <CardHeader className='w-[100%]'>
                                <CardDescription className="w-max">Кол-во Всех просроченных задач</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {dataUserHello?.all_completed_late}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </>
                ): null}
            </div>
            <h3 className="mt-4 mb-2 font-medium">Ваше соотношение выполненных в срок работ</h3>
            <ChartContainer className="w-[400px]" config={chartConfig}>
                <RadialBarChart
                    data={chartData}
                    endAngle={180}
                    innerRadius={80}
                    outerRadius={130}
                    className="translate-x-[-66px]"
                >
                    <ChartTooltip
                        className="123321"
                        cursor={true}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                        content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 16}
                                    className="fill-foreground text-2xl font-bold"
                                >
                                    {chartData[0].badWorkTime}
                                </tspan>
                                <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 4}
                                    className="fill-muted-foreground"
                                >
                                    Задержек
                                </tspan>
                                </text>
                            )
                            }
                        }}
                        />
                    </PolarRadiusAxis>
                    <RadialBar
                        dataKey="badWorkTime"
                        stackId="a"
                        cornerRadius={5}
                        fill="#B9583F"
                        className="stroke-transparent stroke-2"
                    />
                    <RadialBar
                        dataKey="goodWorkTime"
                        fill="#217E72"
                        stackId="a"
                        cornerRadius={5}
                        className="stroke-transparent stroke-2"
                    />
                </RadialBarChart>
            </ChartContainer>
            {/* <ChartRadialStacked/> */}
        </div>
    )
}
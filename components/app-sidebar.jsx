"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useData } from "@/app/components/DataContext"
import useSocket from "@/app/components/useSocket"
import { toast, Toaster } from "sonner"
import { eventBus } from "@/app/utils/eventBus"

export function AppSidebar({
  ...props
}) {
  // This is sample data.
  const { userData, incrementNotificationCount } = useData()
  const socketRef = useSocket(); // подключение ws
  const socket = socketRef.current;
/*   const [notificationCount, setNotificationCount] = React.useState(0);
  React.useEffect(()=>{
    setNotificationCount(userData?.userNotificationCount)
  }, [userData]) */
  React.useEffect(() => {
    if (!socket || !userData) return;

    // Подписываемся на событие
    socket.on("taskCreated", (userIds) => {
      console.log(userIds)
      for(let i = 0; i < userIds.length; i++){
        if(userIds[i] === userData.userId){
          incrementNotificationCount();
          toast.info("Для вас создана новая задача");
          eventBus.emit("refreshTable");
          break
        }
      }
    });
    socket.on("taskReported", (taskId, user, taskPart) => {
      for(let i = 0; i < userData.tasksData.length; i++){
        if(userData.userRole === 'admin' || taskId === userData.tasksData[i]){
          toast.info(`Добавлен отчет в задачу ${taskId}`,{
            description: `${user}, добавил отчет, по этапу ${taskPart}`,
            duration: 12000
          });
          eventBus.emit("refreshTask");
          break
        }
      }
    });

    return () => {
      // Отписываемся от правильного события
      socket.off("taskCreated");
      socket.off("taskReported");
    };
  }, [userData, socket]);
const data = {
    user: {
      name: userData && userData.userName,
      post: userData && userData.userPost,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData?.userName)}&chars=1`,
    },
    navMain: [
      {
        title: "Главная",
        url: "/dashboard",
        icon: SquareTerminal,
        isActive: false
      },
      {
        title: "Задачи",
        url: "#",
        icon: Bot,
        isActive: true,
        items: [
          {
            title: "Активные",
            url: "/dashboard/tasks",
            count: userData?.userNotificationCount || 0
          },
          {
            title: "История",
            url: "/dashboard/tasks?status=history",
          },
          ...(userData?.userRole === 'admin' || userData?.userRole === 'moder' ? [{
            title: "Создать задачу",
            url: "/dashboard/create-task",
          }] : [])
        ],
      },
      {
        title: "Сотрудники",
        url: "/dashboard/staff",
        icon: BookOpen,
        items: [
          {
            title: "Список сотрудников",
            url: "/dashboard/staff",
          },
          ...(userData?.userRole === 'admin' ? [{
            title: "Добавить сотрудника",
            url: "/dashboard/staff/new-user",
          }] : [])
        ]
      },
      ...(userData?.userRole === 'admin' || userData?.userRole === 'moder' ? [{
        title: "Отчет",
        url: "/dashboard/report",
        icon: BookOpen,
      }] : [])
    ],
    projects: (() => {
      const tasks = userData?.tasksData;
      if (!tasks?.length) return null;

      return tasks
        .slice(-3)          // Берем последние 3 задачи
        .reverse()          // Новые задачи первыми
        .map(taskId => ({   // Формируем объекты
          name: `Задача ${taskId}`,
          url: `/dashboard/tasks/${taskId}`
        }));
    })()
  }
  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <h4 className="py-4 px-2">ROMANOV DEV</h4>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

import TableTasks from "../components/TableTasks/TableTasks";
import UserHello from "../components/UserHello/userHello";


export default function Home() {
  return (
    <>
      <UserHello/>
      <TableTasks width={"w-[80%]"}/>
    </>
  );
}

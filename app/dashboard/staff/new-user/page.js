import NewUserForm from "@/app/components/NewUserForm/NewUserForm";
import PagesHeader from "@/app/components/PagesHeader/PagesHeader";


export default function newUserPage() {
  return (
    <>
        <PagesHeader header={"Добавить нового сотрудника"} subheader={"Введите информацио о новом сотруднике"}/>
        <NewUserForm/>
    </>
  );
}

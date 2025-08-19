import PagesHeader from "../../components/PagesHeader/PagesHeader";
import StaffTable from "../../components/StaffTable/StaffTable";

export default function PageStaff() {
  return (
    <>
        <PagesHeader header={"Сотрудники"} subheader={"Информация о сотрудниках"}/>
        <StaffTable/>
    </>
  );
}

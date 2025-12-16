import { Outlet } from "react-router-dom";
import TabsNav from "../Components/TabsNav";

export default function TabLayout() {
  return (
    <>
      <TabsNav />
      <Outlet />
    </>
  );
}

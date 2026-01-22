import { Routes, Route, Navigate } from "react-router-dom";
// import AssignedTasks from "../Dashboard/AssignedTasks";
import LibraryManagementLayout from "../LibraryManagementLayout";
import LibraryDashboard from "../Dashboard/LibraryDashboard";


export default function LibraryRoutes() {
  return (
    <Routes>
      {/* default */}
     <Route path="/" element={<Navigate to="dashboard" replace />} />
    
      {/* dashboard */}
       <Route  element={<LibraryManagementLayout />} >

       <Route path="dashboard" element={<LibraryDashboard />} />
       {/* <Route path="tasks" element={<AssignedTasks />} /> */}
       

     </Route>
    </Routes>
  );
}
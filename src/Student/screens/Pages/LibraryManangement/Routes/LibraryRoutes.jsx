import { Routes, Route, Navigate } from "react-router-dom";

import LibraryManagementLayout from "../LibraryManagementLayout";
import LibraryDashboard from "../Dashboard/LibraryDashboard";
import CheckOut from "../Dashboard/CheckOut";
import CheckIn from "../Dashboard/CheckIn";
import BookCategory from "../Dashboard/BookCategory";
import Penalty from "../Dashboard/Penalty";


export default function StudentLibraryRoutes() {
  return (
    <Routes>
      {/* default */}
     <Route path="/" element={<Navigate to="dashboard" replace />} />
    
      {/* dashboard */}
       <Route  element={<LibraryManagementLayout />} >

       <Route path="dashboard" element={<LibraryDashboard />} />
       <Route path="check-out" element={<CheckOut />} />
       <Route path="check-in" element={<CheckIn />} />
       <Route path="book-category" element={<BookCategory />} />
       <Route path="penalty" element={<Penalty />} />
       

     </Route>
    </Routes>
  );
}
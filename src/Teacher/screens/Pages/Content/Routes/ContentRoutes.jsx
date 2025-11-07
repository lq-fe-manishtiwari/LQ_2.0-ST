import { Routes, Route, Navigate } from "react-router-dom";
import ContentLayout from "../ContentLayout";
import Academic from "../Dashboard/Academic";
import Sport from "../Dashboard/Sport";
import Vertical1_4 from "../Dashboard/Vertical1_4";
import Vertical2 from "../Dashboard/Vertical2";
import Vertical3 from "../Dashboard/Vertical3";
import Vertical5 from "../Dashboard/Vertical5";
import Vertical6 from "../Dashboard/Vertical6";

import Add_Content from "../AddContent/Add_Content";
import StudentProject from "../AddContent/StudentProject";

export default function ContentRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to list when visiting /content */}
      <Route path="/" element={<Navigate to="Academic" replace />} />
      
      {/* ✅ Student list route */}
      <Route element={<ContentLayout />}>
        <Route path="Academic" element={<Academic />} />
        <Route path="Sport" element={<Sport />} />
        <Route path="Vertical1_4" element={<Vertical1_4 />} />
        <Route path="Vertical2" element={<Vertical2 />} />
        <Route path="Vertical3" element={<Vertical3 />} />
        <Route path="Vertical5" element={<Vertical5 />} />
        <Route path="Vertical6" element={<Vertical6 />} />
      </Route>
      
      {/* ✅ Add content route */}      
      <Route path="/add-content" element={<Add_Content />} />
       
      <Route path="/student-project" element={<StudentProject />} />
      
    </Routes>
  );
}

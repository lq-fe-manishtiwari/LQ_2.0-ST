// import { Routes, Route, Navigate } from "react-router-dom";
// // import ProfileDashboard from "../Dashboard/ProfileDashboard";
// // import ProfileLayout from "../ProfileLayout";
// import ContentLayout from "../ContentLayout";
// import ContentDashboard from "../Dashboard/ContentDashboard";

// export default function ContentRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<ContentLayout />}>
//         <Route index element={<ContentDashboard />} />
//         <Route path="dashboard" element={<ContentDashboard />} />
//       </Route>
//     </Routes>
//   );
// }













import { Routes, Route } from "react-router-dom";
import ContentLayout from "../ContentLayout";
import ContentDashboard from "../Dashboard/ContentDashboard";
import AddStudentProject from "../Dashboard/AddStudentProject";
import StudentProjectDashboard from "../Dashboard/StudentProjectDashboard";

export default function ContentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ContentLayout />}>
        <Route index element={<ContentDashboard />} />
        
      </Route>
      <Route path="student-project" element={<StudentProjectDashboard/>}/>
      <Route path="add-project" element={<AddStudentProject/>} />
    </Routes>
  );
}

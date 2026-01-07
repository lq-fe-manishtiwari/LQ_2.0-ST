// import { Routes, Route, Navigate } from "react-router-dom";
// // import ProfileDashboard from "../Dashboard/ProfileDashboard";
// // import ProfileLayout from "../ProfileLayout";
// import ExamLayout from "../ExamLayout";
// import ContentDashboard from "../Dashboard/ContentDashboard";

// export default function ContentRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<ExamLayout />}>
//         <Route index element={<ContentDashboard />} />
//         <Route path="dashboard" element={<ContentDashboard />} />
//       </Route>
//     </Routes>
//   );
// }













import { Routes, Route } from "react-router-dom";
import ExamLayout from "../ExamLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";


export default function ExamRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ExamLayout />}>
        <Route index element={<ExamDashboard />} />
        <Route path="dashboard" element={<ExamDashboard />} />
      </Route>
    </Routes>
  );
}

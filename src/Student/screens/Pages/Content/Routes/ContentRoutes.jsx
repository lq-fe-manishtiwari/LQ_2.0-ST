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

function CalendarView() {
  return <div>Calendar View</div>;
}

function TableView() {
  return <div>Table View</div>;
}

export default function ContentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ContentLayout />}>
        <Route index element={<ContentDashboard />} />
        <Route path="dashboard" element={<TableView />} />
        <Route path="calendar" element={<CalendarView />} />
      </Route>
    </Routes>
  );
}

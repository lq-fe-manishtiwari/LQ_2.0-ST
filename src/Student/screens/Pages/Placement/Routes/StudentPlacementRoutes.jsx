// StudentPlacementRoutes.jsx
import { Routes, Route } from "react-router-dom";
import StudentPlacementLayout from "../StudentPlacementLayout";
import StudentPlacementDashboard from "../Dashboard/StudentPlacementDashboard";
import JobOpeningsList from "../Pages/JobOpeningsList";
import MyRegistrations from "../Pages/MyRegistrations";
import MyInterviews from "../Pages/MyInterviews";
import MyOffers from "../Pages/MyOffers";
import StudentProfile from "../Pages/StudentProfile";
import PlacementConsent from "../Pages/PlacementConsent";
import EligibilityChecker from "../Pages/EligibilityChecker";

const StudentPlacementRoutes = () => (
  <Routes>
    <Route element={<StudentPlacementLayout />}>
      <Route index element={<StudentPlacementDashboard />} />
      <Route path="job-openings" element={<JobOpeningsList />} />
      <Route path="my-registrations" element={<MyRegistrations />} />
      <Route path="my-interviews" element={<MyInterviews />} />
      <Route path="my-offers" element={<MyOffers />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="consent" element={<PlacementConsent />} />
      <Route path="eligibility" element={<EligibilityChecker />} />
    </Route>
  </Routes>
);

export default StudentPlacementRoutes;

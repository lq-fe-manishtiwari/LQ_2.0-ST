import { Routes, Route, Navigate } from "react-router-dom";
import PlacementLayout from "../PlacementLayout";

import PlacementDashboard from "../Dashboard/PlacementDashboard";
import JobOpenings from "../Pages/JobOpenings";
import AddJobOpening from "../Pages/AddJobOpening";
import EditJobOpening from "../Pages/EditJobOpening";
import ViewJobOpening from "../Pages/ViewJobOpening";

import Registration from "../Pages/Registration";
import Interviews from "../Pages/Interviews";
import Offer from "../Pages/Offer";
import ViewRegistration from "../Pages/ViewRegistration";
import ViewInterview from "../Pages/ViewInterview";
import ViewOfferLetter from "../Pages/ViewOfferLetter";
import Companies from "../Pages/Companies";
import Reports from "../Pages/Reports";
import Settings from "../Pages/Settings";
import DriveScheduling from "../Pages/DriveScheduling";
import DriveAttendance from "../Pages/DriveAttendance";
import AddDrive from "../Pages/AddDrive";
import StudentConsents from "../Pages/StudentConsents";
import ViewDrive from "../Pages/ViewDrive";
import EditDrive from "../Pages/EditDrive"

const PlacementRoutes = () => (
  <Routes>
    <Route element={<PlacementLayout />}>


      <Route index element={<PlacementDashboard />} />
      <Route path="/teacher/placement" element={<Navigate to="" replace />} />
      <Route path="jobs" element={<JobOpenings />} />
      <Route path="jobs/add" element={<AddJobOpening />} />
      <Route path="jobs/edit/:id" element={<EditJobOpening />} />
      <Route path="jobs/view/:id" element={<ViewJobOpening />} />
      <Route path="registration" element={<Registration />} />
      <Route path="registration/view/:id" element={<ViewRegistration />} />
      <Route path="offer" element={<Offer />} />
      <Route path="view-offer/:id" element={<ViewOfferLetter/>}/>
      <Route path="interviews" element={<Interviews />} />
      <Route path="view-interview/:id" element={<ViewInterview />} />
      <Route path="companies" element={<Companies/>}/>
      <Route path="reports" element={<Reports/>}/>
      <Route path="drive-scheduling" element={<DriveScheduling/>}/>
      <Route path="drive-attendance/:driveId" element={<DriveAttendance/>}/>
      <Route path="add-drive" element={<AddDrive/>}/>
      <Route path="view-drive/:driveId" element={<ViewDrive/>}/>
      <Route path="edit-drive/:driveId" element={<EditDrive/>}/>
      <Route path="student-consents" element={<StudentConsents/>}/>
    </Route>
    <Route path="settings" element={<Settings />} />
  </Routes>
);

export default PlacementRoutes;


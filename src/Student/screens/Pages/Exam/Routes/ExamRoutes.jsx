import { Routes, Route, Navigate } from "react-router-dom";
import ExamLayout from "../ExamLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";
// import MySubmitted from "../Dashboard/MySubmitted";
// import Pending from "../Dashboard/Pending";
// import FillFeedbackForm from "../Component/FillFeedbackForm";
// import ViewSubmission from "../Component/ViewSubmission";

export default function ExamRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="dashboard" replace />} />

            <Route element={<ExamLayout/>}>
                <Route path="/dashboard" element={<ExamDashboard />} />
                {/* <Route path="pending" element={<Pending />} /> */}
            </Route>

            {/* {/* Standalone routes (without layout) */}
            {/* <Route path="fill/:formId" element={<FillFeedbackForm />} />
            <Route path="view/:responseId" element={<ViewSubmission />} />  */}
        </Routes>
    );
}

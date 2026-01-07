import { Routes, Route, Navigate } from "react-router-dom";
import ExamLayout from "../ExamLayout";
import ExamDashboard from "../Dashboard/ExamDashboard";
import RegularForm from "../Dashboard/RegularForm";
import Result from "../Dashboard/Result";
import ReEvaluation from "../Dashboard/ReEvaluation";
import ATKT from "../Dashboard/ATKT";
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
                <Route path="/regularform" element={<RegularForm />} />
                <Route path="/result" element={<Result />} />
                <Route path="/re-evaluation" element={<ReEvaluation />} />
                <Route path="/atkt" element={<ATKT />} />
            </Route>

            {/* {/* Standalone routes (without layout) */}
            {/* <Route path="fill/:formId" element={<FillFeedbackForm />} />
            <Route path="view/:responseId" element={<ViewSubmission />} />  */}
        </Routes>
    );
}

import { Routes, Route, Navigate } from "react-router-dom";
import FeedbackLayout from "../FeedbackLayout";
import PendingFeedback from "../Dashboard/PendingFeedback";
import SubmittedFeedback from "../Dashboard/SubmittedFeedback";

export default function FeedbackRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="pending-feedback" replace />} />

      <Route element={<FeedbackLayout />}>
        <Route path="pending-feedback" element={<PendingFeedback />} />
        <Route path="submitted-feedback" element={<SubmittedFeedback />} />
      </Route>
    </Routes>
  );
}

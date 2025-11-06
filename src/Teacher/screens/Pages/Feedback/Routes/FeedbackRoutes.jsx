import { Routes, Route, Navigate } from "react-router-dom";
import FeedbackLayout from "../FeedbackLayout";
import FeedbackView from "../Dashboard/FeedbackView";


export default function FeedbackRoutes() {
  return (
    <Routes>
      {/* ✅ Redirect to list when visiting /student */}
      <Route path="/" element={<Navigate to="pending-feedback" replace />} />
      
      {/* ✅ Student list route */}
      <Route element={<FeedbackLayout />}>
  <Route path="pending-feedback" element={<FeedbackView />} />
  <Route path="submitted-feedback" element={<div> Submitted Feedback Content Here</div>} />
</Route>

      
    
    </Routes>
  );
}

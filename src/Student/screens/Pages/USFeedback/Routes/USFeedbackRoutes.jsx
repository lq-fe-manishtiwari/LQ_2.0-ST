import { Routes, Route, Navigate } from "react-router-dom";
import USFeedbackLayout from "../USFeedbackLayout";
import MySubmitted from "../Dashboard/MySubmitted";
import Pending from "../Dashboard/Pending";

export default function USFeedbackRoutes() {
    return (
        <Routes>

            <Route path="/" element={<Navigate to="my-submitted" replace />} />

            <Route element={<USFeedbackLayout />}>
                <Route path="my-submitted" element={<MySubmitted />} />
                <Route path="pending" element={<Pending />} />
            </Route>
        </Routes>
    );
}

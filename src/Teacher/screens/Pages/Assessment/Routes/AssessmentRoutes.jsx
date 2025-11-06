import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AssessmentLayout from "../AssessmentLayout";
import Assessment from "../AssessmentTab/Assessment";
import Questions from "../QuestionsTab/Questions";
import AddNewAssessment from "../AssessmentTab/AddNewAssessment";
import AddNewQuestion from "../AddQuestions/AddNewQuestions";
// import AddNewAssessment from "../AssessmentTab/AddNewAssessment";

export default function AssessmentRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="assessment" replace />} />

      {/* Layout wrapper */}
      <Route element={<AssessmentLayout />}>
        <Route path="assessment" element={<Assessment />} />
        <Route path="questions" element={<Questions />} />
      
      </Route>
      <Route path="/teacher-add-new-assessment" element={<AddNewAssessment />} />
      <Route path="add-question" element={<AddNewQuestion />} />
    </Routes>
  );
}

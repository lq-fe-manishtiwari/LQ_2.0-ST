import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AssessmentLayout from "../AssessmentLayout";
import Assessment from "../AssessmentTab/Assessment";
import Questions from "../QuestionsTab/Questions";
import AddNewAssessment from "../AssessmentTab/AddNewAssessment";
import EditAssessment from "../AssessmentTab/EditAssessment";
import ViewAssessment from "../AssessmentTab/ViewAssessment";
import AddNewQuestion from "../AddQuestions/AddNewQuestions";

export default function AssessmentRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="assessment" replace />} />

      {/* Layout wrapper */}
      <Route element={<AssessmentLayout />}>
        <Route path="assessment" element={<Assessment />} />
        <Route path="questions" element={<Questions />} />

        {/* Assessment actions */}
        <Route path="assessment/view/:id" element={<ViewAssessment />} />
        <Route path="assessment/edit/:id" element={<EditAssessment />} />
        <Route path="add-question" element={<AddNewQuestion />} />
      </Route>

      {/* Standalone page (no sidebar/layout) */}
      <Route
        path="teacher-add-new-assessment"
        element={<AddNewAssessment />}
      />
    </Routes>
  );
}

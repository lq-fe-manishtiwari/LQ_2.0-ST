import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AssessmentLayout from "../AssessmentLayout";
import Assessment from "../AssessmentTab/Assessment";
import Questions from "../QuestionsTab/Questions";
import Dashboard from "../DashboardTab/Dashboard";
import AddNewAssessment from "../AssessmentTab/AddNewAssessment";
import EditAssessment from "../AssessmentTab/EditAssessment";
import ViewAssessment from "../AssessmentTab/ViewAssessment";
import AddNewQuestion from "../AddQuestions/AddNewQuestions";
import CheckPapers from "../AssessmentTab/CheckPapers";
import StudentResults from "../AssessmentTab/StudentResults";

import QuestionLevel from "../QuestionLevelSetting/QuestionLevel";
import SettingsLayout from "../Settings/SettingsLayout";
// import RubricsConfiguration from "../Settings/RubricsConfiguration";
import RubricsMain from "../Settings/Rubrics/RubricsMain";
import ListCO from "../Settings/CO Configure/ListCO";
import AddCO from "../Settings/CO Configure/AddCO";
import EditCO from "../Settings/CO Configure/EditCO";

export default function AssessmentRoutes() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="assessment" replace />} />

      {/* Layout wrapper */}
      <Route element={<AssessmentLayout />}>
        <Route path="assessment" element={<Assessment />} />
        <Route path="questions" element={<Questions />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Assessment actions */}
        <Route path="assessment/view/:id" element={<ViewAssessment />} />
        <Route path="assessment/edit/:id" element={<EditAssessment />} />
        <Route path="add-question" element={<AddNewQuestion />} />

        {/* Extra routes */}
        <Route path="check-papers/:id" element={<CheckPapers />} />
        <Route
          path="student-results/:studentId/:assessmentId"
          element={<StudentResults />}
        />
      </Route>

      {/* Standalone page (no sidebar/layout) */}
      <Route path="teacher-add-new-assessment" element={<AddNewAssessment />} />

      {/* SETTINGS */}
      <Route path="settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="rubrics" replace />} />
        {/* <Route path="rubrics" element={<RubricsConfiguration />} /> */}
        <Route path="rubrics" element={<RubricsMain />} />
        <Route path="co" element={<ListCO />} />
        <Route path="co/Add_CO" element={<AddCO />} />
        <Route path="co/Edit_CO" element={<EditCO />} />
        <Route path="question-level-setting" element={<QuestionLevel />} />
      </Route>
    </Routes>
  );
}

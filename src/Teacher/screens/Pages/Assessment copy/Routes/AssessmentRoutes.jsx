import { Routes, Route, Navigate } from "react-router-dom";
import AssessmentLayout from "../AssessmentLayout";
import Assessment from "../AssessmentTab/Assessment";
import Questions from "../QuestionsTab/Questions";
import AddQuestionPage from "../AddQuestions/AddNewQuestions";
import EditQuestion from "../AddQuestions/EditQuestion";
import ViewQuestion from "../AddQuestions/ViewQuestion";
import QuestionLevel from "../QuestionLevelSetting/QuestionLevel";
import AddNewAssessment from "../AssessmentTab/AddNewAssessment";
import AssesmentDashboard from "../Dashboard/AssesmentDashboard";
import SettingsLayout from "../Settings/SettingsLayout";
// import RubricsConfiguration from "../Settings/RubricsConfiguration";
import RubricMain from "../Settings/Rubrics/RubricMain";
// import EditAssessment from "../AssessmentTab/EditAssessment";
import ViewAssessment from "../AssessmentTab/ViewAssessment";
import CheckPapers from "../AssessmentTab/CheckPapers";
import RubricCheckPapers from "../AssessmentTab/RubricCheckPapers";
import StudentResults from "../AssessmentTab/StudentResults";
import ListCO from "../Settings/COConfigure/ListCO";
import AddCO from "../Settings/COConfigure/AddCO";
import EditCO from "../Settings/COConfigure/EditCO";
import Reports from "../Reports/Reports";

export default function AssessmentRoutes() {
  return (
    <Routes>
      {/* default redirect */}
      <Route path="/" element={<Navigate to="assessment" replace />} />

      {/* MAIN LAYOUT */}
      <Route element={<AssessmentLayout />}>
        <Route path="dashboard" element={<AssesmentDashboard />} />
        <Route path="assessment" element={<Assessment />} />

        {/* ✅ TWO ROUTES (CORRECT WAY) */}
        <Route path="assessment/view" element={<ViewAssessment />} />
        {/* <Route path="assessment/edit" element={<EditAssessment />} /> */}
        <Route path="assessment/check-papers" element={<CheckPapers />} />
        <Route path="assessment/rubric-check-papers" element={<RubricCheckPapers />} />
        {/* <Route path="assessment/student-results" element={<StudentResults />} />
         */}
        <Route path="assessment/student-results/:studentId/:assessmentId"
          element={<StudentResults />}
        />

        <Route path="questions" element={<Questions />} />
        <Route path="reports" element={<Reports />} />

      </Route>

      {/* OUTSIDE LAYOUT */}
      <Route path="add-question" element={<AddQuestionPage />} />
      <Route path="edit-question/:id" element={<EditQuestion />} />
      <Route path="view-question/:id" element={<ViewQuestion />} />
      <Route path="admin-add-new-assessment" element={<AddNewAssessment />} />

      {/* SETTINGS */}
      <Route path="settings" element={<SettingsLayout />}>
        <Route index element={<Navigate to="rubrics" replace />} />
        {/* <Route path="rubrics" element={<RubricsConfiguration />} /> */}
        <Route path="rubrics" element={<RubricMain />} />
        <Route path="co" element={<ListCO />} />
        <Route path="co/Add_CO" element={<AddCO />} />
        <Route path="co/Edit_CO" element={<EditCO />} />
        <Route path="question-level-setting" element={<QuestionLevel />} />
      </Route>
    </Routes>
  );
}

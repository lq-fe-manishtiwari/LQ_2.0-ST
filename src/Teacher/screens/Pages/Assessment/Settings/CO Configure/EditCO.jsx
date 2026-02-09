import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { COService } from "../Service/co.service"; // adjust path
// import SweetAlert if you want alerts

const EditCO = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isEdit, poData } = location.state || {};

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseCoData, setCourseCoData] = useState({});
  const [coValidationErrors, setCoValidationErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const initialValues = {
    grade_id: "",
    semester_id: "",
    subject_id: [],
  };

  useEffect(() => {
    if (isEdit && poData) {
      setSelectedSemester(poData.semester_id);
      setSelectedCourse(poData.subject_id);

      setCourseCoData({
        [poData.subject_id]: [
          {
            co_id: poData.co_id,
            coCode: poData.co_code,
            coStatement: poData.co_statement,
          },
        ],
      });

      setSelectedCourses([poData.subject_id]);
    }

    // Load all courses for the dropdown (you can replace with API)
    setPapers([{ subject_id: poData?.subject_id, name: `Course ${poData?.subject_id}`, paper_code: `C${poData?.subject_id}` }]);
  }, [isEdit, poData]);

  const validateCoFields = () => {
    const errors = {};
    let isValid = true;

    Object.keys(courseCoData).forEach((courseId) => {
      courseCoData[courseId].forEach((co, index) => {
        if (!co.coCode || co.coCode.trim() === "") {
          errors[`${courseId}-${index}-coCode`] = "CO Code is required";
          isValid = false;
        }
        if (!co.coStatement || co.coStatement.trim() === "") {
          errors[`${courseId}-${index}-coStatement`] = "CO Statement is required";
          isValid = false;
        }
      });
    });

    setCoValidationErrors(errors);
    return isValid;
  };

  const handleSingleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    if (!courseCoData[courseId]) {
      setCourseCoData((prev) => ({
        ...prev,
        [courseId]: [{ coCode: "", coStatement: "" }],
      }));
    }
    if (!selectedCourses.includes(courseId)) {
      setSelectedCourses((prev) => [...prev, courseId]);
    }
  };

  const addCoRow = (courseId) => {
    setCourseCoData((prev) => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), { coCode: "", coStatement: "" }],
    }));
  };

  const removeCoRow = (courseId, rowIndex) => {
    setCourseCoData((prev) => {
      const updated = { ...prev };
      if (updated[courseId].length > 1) updated[courseId].splice(rowIndex, 1);
      return updated;
    });
  };

  const handleCoChange = (courseId, rowIndex, field, value) => {
    setCourseCoData((prev) => {
      const updated = { ...prev };
      updated[courseId][rowIndex][field] = value;
      return updated;
    });
    if (value.trim() !== "") {
      setCoValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${courseId}-${rowIndex}-${field}`];
        return newErrors;
      });
    }
  };

  const handleCourseUpdate = async () => {
    if (!validateCoFields()) return;

    const outcomes = (courseCoData[selectedCourse] || []).map((co) => ({
      co_id: co.co_id,
      co_code: co.coCode,
      co_statement: co.coStatement,
    }));

    const semesterIdToSend = selectedSemester || (poData ? poData.semester_id : null);
    if (!semesterIdToSend) {
      alert("Semester is not selected!");
      return;
    }

    try {
      // Update each CO using its ID
      for (const co of outcomes) {
        await COService.UpdatecourseOutcomeId(co.co_id, {
          subject_id: Number(selectedCourse),
          semester_id: Number(semesterIdToSend),
          outcome_code: co.co_code,
          outcome_description: co.co_statement,
        });
      }

      alert("CO updated successfully!");
      navigate(-1); // go back to CO list
    } catch (err) {
      console.error("Error updating CO:", err);
      alert("Failed to update CO. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="pageheading text-xl font-semibold mb-4">Edit CO</h2>

      <Formik initialValues={initialValues} validationSchema={Yup.object({})} onSubmit={() => {}}>
        <Form>
          {/* Course Selector */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block mb-1 font-medium">Paper</label>
              <select
                className="border p-2 rounded w-full"
                value={selectedCourse}
                onChange={(e) => handleSingleCourseSelect(e.target.value)}
                disabled={!selectedSemester}
              >
                <option value="">Select Paper</option>
                {papers.map((c) => (
                  <option key={c.subject_id} value={c.subject_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CO Rows */}
          {selectedCourses.map((courseId) => {
            const course = papers.find((c) => String(c.subject_id) === String(courseId));
            const coRows = courseCoData[courseId] || [];

            return (
              <div key={courseId} className="mb-6 bg-white rounded shadow">
                <div className="bg-primary-600 text-white px-4 py-2 rounded-t">
                  {course?.paper_code} - {course?.name}
                </div>
                <div className="p-4">
                  {coRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-12 gap-4 mb-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="CO Code"
                          value={row.coCode}
                          onChange={(e) => handleCoChange(courseId, rowIndex, "coCode", e.target.value)}
                        />
                        {coValidationErrors[`${courseId}-${rowIndex}-coCode`] && (
                          <div className="text-red-500 text-sm mt-1">{coValidationErrors[`${courseId}-${rowIndex}-coCode`]}</div>
                        )}
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="CO Statement"
                          value={row.coStatement}
                          onChange={(e) => handleCoChange(courseId, rowIndex, "coStatement", e.target.value)}
                        />
                        {coValidationErrors[`${courseId}-${rowIndex}-coStatement`] && (
                          <div className="text-red-500 text-sm mt-1">{coValidationErrors[`${courseId}-${rowIndex}-coStatement`]}</div>
                        )}
                      </div>
                      <div className="col-span-1 flex gap-2">
                        <button type="button" onClick={() => addCoRow(courseId)} className="bg-green-500 text-white p-2 rounded">
                          +
                        </button>
                        <button type="button" onClick={() => removeCoRow(courseId, rowIndex)} className="bg-red-500 text-white p-2 rounded" disabled={coRows.length <= 1}>
                          -
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 flex gap-4 justify-center">
                  <button type="button" onClick={handleCourseUpdate} className="bg-blue-600 text-white px-6 py-2 rounded">
                    Update
                  </button>
                  <button onClick={() => navigate(-1)} type="button" className="bg-gray-400 text-white px-6 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </Form>
      </Formik>
      {alert}
    </div>
  );
};

export default EditCO;

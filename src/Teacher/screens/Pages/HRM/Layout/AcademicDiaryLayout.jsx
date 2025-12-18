import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TabsNav from "../Components/TabsNav";
import AcademicTabsNav from "../Components/AcademicTabsNav";
//import CommonProgramTeacherFilter from "../AcademicDiary/ProgramTeacherFilter";

export default function AcademicDiaryLayout() {
    const [filters, setFilters] = useState({
    programId: "",
    teacherId: "",
  });

  return (
    <div className="p-0 sm:p-6">
      <h2 className="pageheading mb-2 sm:mb-4">Academic Diary</h2>
      <AcademicTabsNav/>

      {/* <CommonProgramTeacherFilter filters={filters} onChange={setFilters} /> */}

      <div className="mt-1 sm:mt-3 sm:bg-white sm:p-4 sm:rounded-xl sm:shadow-sm sm:border sm:border-gray-100">
        <Outlet context={{ filters }} />
      </div>
    </div>
  );
}

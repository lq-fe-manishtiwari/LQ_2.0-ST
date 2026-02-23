import React, { useState } from "react";
import ListOfBooks from "./ListOfBooks";
import Participations from "./Participations";
import Publications from "./Publications";
import Counseling from "./Counseling";
import Societal from "./Societal";
import OtherContributions from "./OtherContributions";
import LecturesObserved from "./LecturesObserved";
import IPR from "./IPR";
import { ChevronDown, ChevronUp } from "lucide-react";

const contributionsList = [
  {
    key: "books",
    title: "List of Books / Journals Referred",
    component: <ListOfBooks />,
  },
  {
    key: "participations",
    title: "Participations in Seminars / Conferences / Workshops",
    component: <Participations />,
  },
  { key: "publications", title: "List of Publications", component: <Publications /> },
  { key: "counseling", title: "Counseling of Students", component: <Counseling /> },
  { key: "societal", title: "Societal Contributions", component: <Societal /> },
  {
    key: "lectures",
    title: "Lectures Observed",
    component: <LecturesObserved />,
  },
  {
    key: "ipr",
    title: "Intellectual Property Rights (IPR)",
    component: <IPR />,
  },
  { key: "other", title: "Any Other Contributions", component: <OtherContributions /> },
];

const Contributions = () => {
  const [expandedKey, setExpandedKey] = useState(null);

  const toggleExpand = (key) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  return (
    <div className=" bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Academic Diary – Contributions
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Record of academic, professional and societal contributions
          </p>
        </div>

        {/* Accordion List */}
        <ul className="space-y-4">
          {contributionsList.map((item) => (
            <li
              key={item.key}
              className="bg-white rounded-xl border shadow-sm overflow-hidden"
            >
              {/* Header */}
              <button
                className="w-full flex justify-between items-center px-5 py-3 text-left hover:bg-gray-50 focus:outline-none"
                onClick={() => toggleExpand(item.key)}
              >
                <span className="text-gray-800 font-medium">{item.title}</span>
                {expandedKey === item.key ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </button>

              {/* Content */}
              {expandedKey === item.key && (
                <div className="px-5 py-4 border-t">{item.component}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Contributions;

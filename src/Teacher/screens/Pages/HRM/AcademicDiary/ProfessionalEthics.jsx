import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { UserX } from "lucide-react";

const ETHICS_DATA = [
  {
    title: "Teachers and Their Responsibilities",
    points: [
      "Adhere to a responsible pattern of conduct and demeanor expected by the community.",
      "Manage private affairs consistent with the dignity of the profession.",
      "Seek continuous professional growth through study and research.",
      "Express free and frank opinions in seminars, conferences, and professional meetings.",
      "Maintain active membership in professional organizations.",
      "Perform teaching, tutorials, practicals, seminars, and research work conscientiously.",
      "Assist in academic responsibilities like admissions, counseling, examinations, invigilation, and evaluation.",
      "Participate in extension, co-curricular, extracurricular activities and community service."
    ]
  },
  {
    title: "Teachers and the Students",
    points: [
      "Respect the rights and dignity of students in expressing opinions.",
      "Deal impartially with students regardless of religion, caste, gender, or background.",
      "Recognize individual differences in aptitude and capabilities.",
      "Encourage personality development and community welfare.",
      "Inculcate scientific outlook, democracy, patriotism, and peace.",
      "Be affectionate and non-vindictive towards students.",
      "Assess students based only on merit.",
      "Be available to students beyond class hours without remuneration.",
      "Promote understanding of national heritage and goals.",
      "Refrain from inciting students against others."
    ]
  },
  {
    title: "Teachers and Colleagues",
    points: [
      "Treat colleagues with the same respect they expect.",
      "Speak respectfully and assist in professional growth.",
      "Avoid unsubstantiated allegations against colleagues.",
      "Avoid discrimination based on caste, creed, religion, race, or gender."
    ]
  },
  {
    title: "Teachers and Authorities",
    points: [
      "Discharge responsibilities according to institutional rules.",
      "Avoid private tuitions or engagements affecting professional duties.",
      "Co-operate in policy formulation of the institution.",
      "Accept institutional responsibilities and offices.",
      "Work for institutional betterment with dignity.",
      "Adhere to contractual conditions.",
      "Provide due notice before change of position.",
      "Avoid unnecessary leave and prioritize academic schedules."
    ]
  },
  {
    title: "Teachers and Non-Teaching Staff",
    points: [
      "Treat non-teaching staff as equal partners in institutional functioning.",
      "Support joint staff councils involving teaching and non-teaching staff."
    ]
  },
  {
    title: "Teachers and Guardians",
    points: [
      "Maintain regular communication with guardians.",
      "Share student performance reports when necessary.",
      "Participate in guardian meetings for mutual exchange of ideas."
    ]
  },
  {
    title: "Teachers and Society",
    points: [
      "Recognize education as a public service.",
      "Work to improve community education and moral life.",
      "Be aware of social problems and contribute positively.",
      "Participate in civic and community responsibilities.",
      "Avoid activities promoting hatred or division and work for national integration."
    ]
  }
];

export default function ProfessionalEthics() {
  const { filters } = useOutletContext() || {};
  const [openIndex, setOpenIndex] = useState(0);

  if (!filters?.programId || !filters?.teacherId) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-500">
          <UserX className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-600">
            No Teacher Selected
          </p>
          <p className="text-sm mt-1 max-w-sm">
            Please select a <span className="font-medium">Program</span> and a{" "}
            <span className="font-medium">Teacher</span> from the filters above to
            view professional ethics details.
          </p>
        </div>
      );
    }

  return (
    <div className="mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          Code of Professional Ethics
        </h2>
      </div>

      {/* Ethics Sections */}
      <div className="space-y-4">
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> */}
        {ETHICS_DATA.map((section, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="border rounded-xl bg-white shadow-sm"
            >
              {/* Header */}
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-bold">
                    {index + 1}.
                  </span>
                  <h3 className="font-semibold text-gray-800">
                    {section.title}
                  </h3>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-6 pb-5">
                  <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm leading-relaxed">
                    {section.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-500 text-right">
        Reference: <span className="italic">UGC Guidelines</span>
      </div>
    </div>
  );
}

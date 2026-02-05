import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Printer, FileText, Info, Target, ListChecks, Calendar, Clock, Loader2 } from "lucide-react";
import SweetAlert from "react-bootstrap-sweetalert";
import { teachingPlanService } from "../../Services/teachingPlan.service";

export default function ViewTeachingPlan() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [plan, setPlan] = useState(null);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!id) return;
            setFetching(true);
            try {
                const data = await teachingPlanService.GetTeachingPlanById(id);
                if (data) {
                    setPlan(data);
                } else {
                    throw new Error("Plan not found");
                }
            } catch (error) {
                console.error("Error fetching plan:", error);
                setAlert(
                    <SweetAlert
                        danger
                        title="Error"
                        onConfirm={() => navigate("/teacher/academic-diary/teaching-plan")}
                    >
                        Teaching plan not found or removed.
                    </SweetAlert>
                );
            } finally {
                setFetching(false);
            }
        };

        fetchPlan();
    }, [id, navigate]);

    const handlePrint = () => {
        window.print();
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading plan details...</p>
            </div>
        );
    }

    if (!plan) return null;

    return (
        <div className="container-fluid p-4 bg-gray-50 min-h-screen print:bg-white print:p-0">
            {alert}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/teacher/academic-diary/teaching-plan")}
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">View Teaching Plan</h1>
                        <p className="text-sm text-gray-500">Review the comprehensive teaching strategy</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print Plan
                    </button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block text-center mb-10 border-b-2 border-gray-900 pb-6">
                <h1 className="text-3xl font-bold uppercase mb-2">Teaching Plan</h1>
                <div className="grid grid-cols-2 gap-4 text-left max-w-4xl mx-auto mt-6">
                    <div><span className="font-bold">Teacher:</span> {plan.teacher_name || plan.teacher_id}</div>
                    <div><span className="font-bold">Academic Year:</span> {plan.academic_year_name || plan.academic_year_id}</div>
                    <div><span className="font-bold">Program:</span> {plan.program_name || plan.program_id}</div>
                    <div><span className="font-bold">Subject:</span> {plan.subject_name || plan.subject_id}</div>
                    <div><span className="font-bold">Semester:</span> {plan.semester_name || plan.semester_id}</div>
                    <div><span className="font-bold">Batch/Div:</span> {plan.batch_name || plan.batch_id} / {plan.division_name || plan.division_id}</div>
                </div>
            </div>

            <div className="space-y-8 max-w-7xl mx-auto pb-20 print:pb-0">

                {/* Academic & Course Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
                    {/* Basic Context */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-blue-900">Academic Context</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Program</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.program_name || plan.program_id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Subject</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.subject_name || plan.subject_id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Teacher</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.teacher_name || plan.teacher_id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Year / Sem</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.academic_year_name || plan.academic_year_id} / {plan.semester_name || plan.semester_id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Department Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-semibold text-indigo-900">Course Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Department</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.department_name || plan.department || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Level</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.level_of_subject || plan.levelOfSubject || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Batch</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.batch_name || plan.batch_id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase">Division</p>
                                <p className="text-sm font-semibold text-gray-700">{plan.division_name || plan.division_id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Objectives Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden break-inside-avoid">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-emerald-900">Course Objectives</h2>
                    </div>
                    <div className="p-6">
                        <ul className="space-y-3">
                            {plan.objectives?.map((obj, idx) => (
                                <li key={idx} className="flex gap-4 items-start">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700 shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {typeof obj === 'string' ? obj : obj.objective}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Course Outcomes Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden break-inside-avoid">
                    <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-2">
                        <ListChecks className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-amber-900">Course Outcomes</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {plan.course_outcome?.map((desc, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <div className="px-2 py-1 h-fit rounded bg-amber-100 text-[10px] font-bold text-amber-700 uppercase">
                                        CO{idx + 1}
                                    </div>
                                    <p className="text-sm text-gray-700">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Teaching Plan Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden break-inside-avoid shadow-lg">
                    <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center gap-2 print:bg-white print:border-gray-900">
                        <Calendar className="w-5 h-5 text-rose-600 print:text-gray-900" />
                        <h2 className="text-lg font-semibold text-rose-900 print:text-gray-900 uppercase tracking-wider">Detailed Execution Plan</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] border-collapse">
                            <thead className="bg-gray-800 text-white print:bg-white print:text-black">
                                <tr>
                                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest border-r border-gray-700">Module / Topic</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest border-r border-gray-700 w-24">CO Map</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest border-r border-gray-700 w-32">Timeline</th>
                                    <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-widest border-r border-gray-700 w-20">Hours</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest border-r border-gray-700">Activities & Techniques</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {plan.modules?.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-4 border-r border-gray-100">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-900">{m.module_name || 'N/A'}</span>
                                                <span className="text-xs italic text-gray-500">{m.topic_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-r border-gray-100 text-center">
                                            <div className="flex flex-wrap gap-1">
                                                {m.co?.map(co => (
                                                    <span key={co} className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-100">
                                                        {co}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-r border-gray-100">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-gray-700">{m.month}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Week {m.week}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 border-r border-gray-100 text-center">
                                            <span className="px-2 py-1 rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                                                {m.lecture_hour} hrs
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold uppercase text-gray-400">Pre-Class</span>
                                                    <p className="text-[11px] text-gray-600 leading-tight">{m.pre_class_activity}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold uppercase text-gray-400">Instructional</span>
                                                    <p className="text-[11px] text-gray-600 leading-tight">{m.instructional_technique}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold uppercase text-gray-400">Post-Class</span>
                                                    <p className="text-[11px] text-gray-600 leading-tight">{m.post_class_activity}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-center text-[10px] text-gray-400 py-8 italic hidden print:block">
                    This is a system generated teaching plan. Generated on {new Date().toLocaleDateString()}.
                </div>
            </div>

            <style>
                {`
                @media print {
                    @page { margin: 1cm; }
                    body { -webkit-print-color-adjust: exact; }
                }
                `}
            </style>
        </div>
    );
}

import React, { useState } from "react";
import { createPortal } from "react-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Loader2, X, Calendar } from "lucide-react";
import { timetableService } from "../Services/timetable.service";

const formatTimeForDisplay12hr = (timeString) => {
    if (!timeString) return "N/A";
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
    } catch (e) {
        return timeString;
    }
};

const formatDateDMY = (dateObj) => {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
};

const getMonday = (d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
};

export const exportTimetableToPDF = (data, startDateStr, endDateStr, academicInfo) => {
    try {
        const doc = new jsPDF("landscape");

        const collegeName = academicInfo?.college || 'College Name';
        const teacherName = academicInfo?.name || 'Teacher Name';
        const department = academicInfo?.department || '';

        // Group data by week (using the Monday date as key)
        const weeklyData = {};

        data.forEach(slot => {
            let slotDate;
            try {
                slotDate = new Date(slot.date);
            } catch (e) {
                return;
            }
            if (isNaN(slotDate)) return;

            const monday = getMonday(slotDate);
            const weekKey = monday.getTime();

            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {
                    monday: monday,
                    slots: []
                };
            }
            weeklyData[weekKey].slots.push(slot);
        });

        const weekKeys = Object.keys(weeklyData).sort((a, b) => Number(a) - Number(b));

        const pageWidth = doc.internal.pageSize.getWidth();

        weekKeys.forEach((weekKey, index) => {
            if (index > 0) {
                doc.addPage();
            }

            const weekInfo = weeklyData[weekKey];
            const monday = new Date(weekInfo.monday);
            const sunday = new Date(monday);
            sunday.setDate(sunday.getDate() + 6);

            // Add Header
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(collegeName, pageWidth / 2, 15, { align: "center" });

            doc.setFontSize(12);
            doc.text(`Timetable - ${teacherName}`, pageWidth / 2, 22, { align: "center" });

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Week: ${formatDateDMY(monday)} to ${formatDateDMY(sunday)}`, pageWidth / 2, 29, { align: "center" });

            // Extract unique time slots for this week
            const timeSlotsSet = new Set();
            weekInfo.slots.forEach(s => {
                if (s.start_time && s.end_time && !s.is_holiday) {
                    timeSlotsSet.add(`${s.start_time}-${s.end_time}`);
                }
            });
            const timeSlots = Array.from(timeSlotsSet).sort((a, b) => a.localeCompare(b));

            // Setup columns (Time + 7 Days)
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            const tableCols = ["Time Slot"];
            const datesForWeek = [];
            for (let i = 0; i < 7; i++) {
                const currentDayDate = new Date(monday);
                currentDayDate.setDate(currentDayDate.getDate() + i);
                datesForWeek.push(formatDateDMY(currentDayDate));
                tableCols.push(`${days[i]}\n${datesForWeek[i]}`);
            }

            const headerRow = [tableCols];
            const bodyRows = [];

            // Add Holidays if any for the week at the top, or distribute them
            const holidays = weekInfo.slots.filter(s => s.is_holiday);

            timeSlots.forEach(timeStr => {
                const [start, end] = timeStr.split("-");
                const formattedTime = `${formatTimeForDisplay12hr(start)} - \n${formatTimeForDisplay12hr(end)}`;

                const row = [formattedTime];

                for (let i = 0; i < 7; i++) {
                    const currentDayStrDate = new Date(monday);
                    currentDayStrDate.setDate(currentDayStrDate.getDate() + i);

                    const cellDateStrYMD = `${currentDayStrDate.getFullYear()}-${String(currentDayStrDate.getMonth() + 1).padStart(2, '0')}-${String(currentDayStrDate.getDate()).padStart(2, '0')}`;

                    // Check if holiday
                    const holiday = holidays.find(h => h.date === cellDateStrYMD);
                    if (holiday) {
                        row.push(`HOLIDAY\n${holiday.holiday_name || ''}`);
                        continue;
                    }

                    // Find slots for this day and time
                    const matchSlots = weekInfo.slots.filter(s => s.date === cellDateStrYMD && s.start_time === start && s.end_time === end && !s.is_holiday);

                    if (matchSlots.length > 0) {
                        const cellTextItems = matchSlots.map(slot => {
                            let programBatch = "";
                            if (slot.program_name) programBatch += slot.program_name + " ";
                            if (slot.semester_name) programBatch += slot.semester_name + " ";
                            if (slot.batch_name) programBatch += slot.batch_name + " ";
                            if (slot.division_name) programBatch += `Div: ${slot.division_name}`;

                            return `${slot.subject_name || slot.subject || "-"}\n${programBatch.trim()}\nRoom: ${slot.room_number || slot.room || slot.classroom || "-"}`;
                        });
                        row.push(cellTextItems.join("\n\n"));
                    } else {
                        row.push("-");
                    }
                }
                bodyRows.push(row);
            });

            holidays.forEach(holiday => {
                let hasRowWithHoliday = false;
                bodyRows.forEach(row => {
                    if (row.some(cellText => cellText.includes("HOLIDAY") && cellText.includes(holiday.holiday_name || ""))) {
                        hasRowWithHoliday = true;
                    }
                });
                if (!hasRowWithHoliday && timeSlots.length === 0) {
                    const r = ["All Day"];
                    for (let i = 0; i < 7; i++) {
                        const currentDayStrDate = new Date(monday);
                        currentDayStrDate.setDate(currentDayStrDate.getDate() + i);
                        const cellDateStrYMD = `${currentDayStrDate.getFullYear()}-${String(currentDayStrDate.getMonth() + 1).padStart(2, '0')}-${String(currentDayStrDate.getDate()).padStart(2, '0')}`;
                        if (holiday.date === cellDateStrYMD) {
                            r.push(`HOLIDAY\n${holiday.holiday_name || ''}`);
                        } else {
                            r.push("-");
                        }
                    }
                    bodyRows.push(r);
                }
            });

            autoTable(doc, {
                head: headerRow,
                body: bodyRows,
                startY: 35,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 3, halign: 'center', valign: 'middle' },
                headStyles: { fillColor: [41, 100, 235], textColor: 255, fontStyle: 'bold', halign: 'center' },
                alternateRowStyles: { fillColor: [245, 248, 255] },
                margin: { top: 35 },
                didDrawPage: function (data) {
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.text(`Page ${data.pageNumber}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
                }
            });
        });

        if (weekKeys.length === 0) {
            doc.setFontSize(12);
            doc.text("No timetable data found for the selected date range.", pageWidth / 2, 50, { align: "center" });
        }

        doc.save(`Timetable_${startDateStr}_to_${endDateStr}.pdf`);
        return true;
    } catch (error) {
        console.error("Error generating PDF:", error);
        return false;
    }
};

const TimetableExport = ({ currentDate, filters, academicInfo }) => {
    const [showModal, setShowModal] = useState(false);

    // Default start date is today, end date is the end of the current month
    const initStart = new Date();

    const initEnd = new Date(initStart.getFullYear(), initStart.getMonth() + 1, 0);

    const [startDate, setStartDate] = useState(initStart.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(initEnd.toISOString().split('T')[0]);

    const [isExporting, setIsExporting] = useState(false);

    const handleDownload = async () => {
        const teacher_id = filters?.teacher?.teacher_id || filters?.teacher;
        const activeCollege = JSON.parse(localStorage.getItem("activeCollege"));
        const college_id = activeCollege?.id;

        if (!teacher_id || !college_id || !startDate || !endDate) return;

        try {
            setIsExporting(true);

            const params = {
                teacher_id: typeof teacher_id === 'object' ? teacher_id.teacher_id : teacher_id,
                college_id: college_id,
                start_date: startDate,
                end_date: endDate
            };

            const res = await timetableService.getTeacherTimetable(params);

            let allSlots = [];
            if (res && res.daily_schedules) {
                res.daily_schedules.forEach(day => {
                    if (day.is_holiday) {
                        allSlots.push({
                            date: day.date,
                            is_holiday: true,
                            holiday_name: day.holiday_name
                        });
                    } else if (day.slots && day.slots.length > 0) {
                        day.slots.forEach(slot => {
                            if (slot && slot.exception_type !== 'CANCELLED') {
                                allSlots.push({
                                    ...slot,
                                    date: day.date
                                });
                            }
                        });
                    }
                });
            }

            const exportAcademicInfo = academicInfo || {
                name: filters?.teacher?.name || 'Teacher',
                department: filters?.teacher?.department_name || ''
            };

            exportTimetableToPDF(allSlots, startDate, endDate, exportAcademicInfo);
            setShowModal(false);
        } catch (err) {
            console.error("Error exporting timetable:", err);
            alert("Failed to export timetable. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-2.5 py-1.5 rounded-lg 
             border border-green-600 
             bg-green-600 text-white 
             text-xs font-bold 
             hover:bg-green-700 
             flex items-center gap-1.5 
             transition-colors"
                title="Export Timetable To PDF"
            >
                <Download size={14} />
                <span>Export</span>
            </button>

            {showModal && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.2)] w-full max-w-lg min-h-[300px] flex flex-col relative z-50 transform transition-all">
                        {/* Header */}
                        <div className="bg-[#295bcc] px-6 py-4 flex items-center justify-between text-white rounded-t-2xl">
                            <h3 className="font-semibold text-lg tracking-wide">Export Timetable PDF</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer">
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex-1 overflow-visible">
                            <div className="flex flex-col sm:flex-row gap-6 mb-8">
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 tracking-wider">
                                        <Calendar size={15} strokeWidth={2.5} className="text-[#3b82f6]" />
                                        START DATE
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base font-medium text-slate-800 bg-white focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none shadow-sm transition-all relative z-[100]"
                                        style={{ minHeight: '50px', colorScheme: 'light' }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2 tracking-wider">
                                        <Calendar size={15} strokeWidth={2.5} className="text-[#3b82f6]" />
                                        END DATE
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base font-medium text-slate-800 bg-white focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none shadow-sm transition-all relative z-[100]"
                                        style={{ minHeight: '50px', colorScheme: 'light' }}
                                    />
                                </div>
                            </div>

                            <div className="bg-[#f8fafc] border border-blue-100 p-5 rounded-2xl mb-8 border-l-4 border-l-[#3b82f6] shadow-sm">
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    The exported PDF will include detailed class schedules grouped by week. Make sure the date range is within the current academic semester.
                                </p>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={isExporting}
                                className="w-full py-4 bg-[#295bcc] hover:bg-[#204bad] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:hover:bg-[#295bcc] text-base"
                            >
                                {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} strokeWidth={2.5} />}
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default TimetableExport;

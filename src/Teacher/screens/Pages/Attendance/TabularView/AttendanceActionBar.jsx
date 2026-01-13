import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function AttendanceActionBar({ onMarkAllPresent, onMarkAllAbsent }) {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onMarkAllPresent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
            >
                <CheckCircle size={16} />
                <span>Mark All Present</span>
            </button>
            <button
                onClick={onMarkAllAbsent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
            >
                <XCircle size={16} />
                <span>Mark All Absent</span>
            </button>
        </div>
    );
}

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export default function AttendanceStatusButton({ status, onClick }) {
    const isPresent = status === "P";

    return (
        <div className="flex justify-center">
            <button
                onClick={onClick}
                className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${isPresent
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 shadow-sm hover:shadow-md"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 hover:from-red-200 hover:to-rose-200 shadow-sm hover:shadow-md"
                    }`}
                style={{
                    animation: "statusChange 0.4s ease-out",
                }}
            >
                {isPresent ? (
                    <>
                        <CheckCircle size={18} className="animate-bounce-in" />
                        <span className="font-semibold">Present</span>
                    </>
                ) : (
                    <>
                        <XCircle size={18} className="animate-bounce-in" />
                        <span className="font-semibold">Absent</span>
                    </>
                )}
            </button>

            <style jsx>{`
        @keyframes statusChange {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
        </div>
    );
}

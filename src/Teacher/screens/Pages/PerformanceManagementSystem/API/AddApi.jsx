import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddApi() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F7F7F7] p-3 sm:p-4 md:p-5 lg:p-6 pb-6 sm:pb-8 md:pb-10 lg:pb-12">
            {/* Container Card */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 md:p-6 lg:p-8 max-w-6xl mx-auto mb-4 sm:mb-6">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    {/* LEFT: HEADING */}
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-700">Add API</h2>
                    </div>

                    {/* RIGHT: CLOSE BUTTON */}
                    <button
                        onClick={() => navigate("/pms/api")}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 sm:w-10 sm:h-10 
                        flex items-center justify-center rounded-full shadow-md transition-all duration-200
                        hover:scale-105 active:scale-95"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">

                    {/* EMP Input */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-2">EMP Input</label>
                        <input
                            type="text"
                            placeholder="Enter emp rating"
                            className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* EMP Self Rating */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-2">EMP Self Rating</label>
                        <input
                            type="text"
                            placeholder="Enter emp self rating"
                            className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* Achievement */}
                    <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Achievement</label>
                        <input
                            type="text"
                            placeholder="Add achievement"
                            className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* Manager 1 Input */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Manager 1 Input</label>
                        <input
                            type="text"
                            placeholder="Enter manager input"
                            className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* Manager 1 Rating */}
                    <div className="col-span-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Manager 1 Rating</label>
                        <input
                            type="text"
                            placeholder="Enter manager rating"
                            className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* Manager 2 Input */}
                    <div className="col-span-1 xs:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Manager 2 Input</label>
                        <input
                            type="text"
                            placeholder="Enter manager input"
                            className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* Manager 2 Rating - Centered */}
                    <div className="col-span-1 xs:col-span-2 lg:col-span-3">
                        <div className="flex justify-center">
                            <div className="w-full xs:w-4/5 sm:w-3/5 md:w-2/5 lg:w-1/3 xl:w-1/4">
                                <label className="block text-sm font-semibold text-blue-700 mb-2">Manager 2 Rating</label>
                                <input
                                    type="text"
                                    placeholder="Enter manager rating"
                                    className="w-full border rounded px-3 py-2 focus:outline-none transition-colors border-gray-300 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-center gap-4 mt-8">
                    <button className="px-8 py-3 rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 transition-all font-medium">
                        Submit
                    </button>
                    <button
                        onClick={() => navigate("/pms/api")}
                        className="px-8 py-3 rounded-lg shadow-md text-white bg-orange-500 hover:bg-orange-600 transition-all font-medium">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
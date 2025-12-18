import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Upload, X, Loader2, CloudUpload } from "lucide-react";
import * as XLSX from "xlsx";
import SweetAlert from "react-bootstrap-sweetalert";
import Loader from '../Components/Loader';

export default function ReportFormat() {
    const [excelData, setExcelData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    const processFile = useCallback((file) => {
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            alert("Please upload a valid Excel file (.xlsx, .xls, .csv)");
            return;
        }

        setIsLoading(true);
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const filteredData = jsonData.filter(row =>
                    row.some(cell => cell !== null && cell !== undefined && cell !== "")
                );

                setTimeout(() => {
                    setExcelData(filteredData);
                    setIsLoading(false);
                }, 50);
            } catch (error) {
                alert("Invalid Excel file");
                setIsLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    }, []);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, [processFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleCancel = useCallback(() => {
        setExcelData([]);
        setFileName("");
        setIsLoading(false);
        setCurrentPage(1);
        document.getElementById("excel-file-input").value = "";
    }, []);

    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

    const { maxColumns, headers, tableData, totalEntries, totalPages, currentEntries, start, end } = useMemo(() => {
        if (excelData.length === 0) return { maxColumns: 0, headers: [], tableData: [], totalEntries: 0, totalPages: 0, currentEntries: [], start: 0, end: 0 };
        
        const maxCols = Math.max(...excelData.map(row => row.length));
        const allTableData = excelData.slice(1);
        const totalEntries = allTableData.length;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        const currentEntries = allTableData.slice(start, end);
        
        return {
            maxColumns: maxCols,
            headers: excelData[0] || [],
            tableData: allTableData,
            totalEntries,
            totalPages,
            currentEntries,
            start,
            end
        };
    }, [excelData, currentPage, entriesPerPage]);

    return (
        <div className="w-full min-h-screen flex flex-col items-center px-3 sm:px-6 pt-4 sm:pt-10 pb-16 sm:pb-20">

            <input
                id="excel-file-input"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center tracking-tight mb-2 px-2" style={{color: 'rgb(33, 98, 193)'}}>
                Performance Management Report Format
            </h1>
            <div className="h-1 w-16 sm:w-20 bg-blue-600 mx-auto rounded-full mb-4 sm:mb-6 md:mb-10"></div>

            {/* Upload Button */}
            <button
                onClick={() => document.getElementById("excel-file-input").click()}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 
                           bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium
                           px-4 sm:px-6 md:px-10 py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg transition-all 
                           w-full max-w-sm sm:max-w-xl text-sm sm:text-base touch-manipulation min-h-[48px]"
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Upload className="w-5 h-5" />
                )}
                {isLoading ? 'Processing...' : 'Bulk Upload Excel'}
            </button>

            {/* Uploaded file name preview */}
            {fileName && (
                <div className="w-full max-w-4xl mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-900">Selected File</p>
                        <p className="text-blue-700 text-xs sm:text-sm break-all">{fileName}</p>
                    </div>

                    <button
                        onClick={handleCancel}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* If no file uploaded */}
            {!fileName && (
                <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById("excel-file-input").click()}
                    className={`w-full max-w-4xl mt-4 sm:mt-6 md:mt-8 py-8 sm:py-10 md:py-14 px-3 sm:px-4 md:px-5 border-2 border-dashed rounded-lg sm:rounded-xl shadow-sm text-center cursor-pointer transition-colors
                        ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                >
                    <CloudUpload className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-700"  />
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-700 px-2">Drop Excel file here or click to upload</h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 px-2">
                        Supports .xlsx, .xls, .csv files
                    </p>
                </div>
            )}

            {/* Excel Data Display */}
            {excelData.length > 0 && (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block w-full max-w-5xl mt-4 sm:mt-6 md:mt-10 bg-white rounded-lg sm:rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-auto max-h-[50vh] sm:max-h-[60vh] -webkit-overflow-scrolling-touch">
                            <table className="min-w-full border-collapse">
                                <thead className="sticky top-0 table-header text-white shadow-md z-10">
                                    <tr>
                                        {headers.map((cell, idx) => (
                                            <th
                                                key={idx}
                                                className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold border-r border-blue-500 text-center min-w-[80px] whitespace-nowrap"
                                            >
                                                {String(cell)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={headers.length} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Loader size="lg" className="mb-4" />
                                                    <p className="text-gray-500">Loading report data...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentEntries.map((row, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                className={`${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors duration-150`}
                                            >
                                                {row.map((cell, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-b border-r border-gray-200 text-gray-700 text-xs sm:text-sm text-center break-words"
                                                    >
                                                        {String(cell || '')}
                                                    </td>
                                                ))}
                                                {Array.from({
                                                    length: Math.max(0, maxColumns - row.length)
                                                }).map((_, i) => (
                                                    <td
                                                        key={`empty-${i}`}
                                                        className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-b border-r border-gray-200 bg-gray-100"
                                                    ></td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Desktop Pagination */}
                        {totalEntries > 0 && (
                            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        currentPage === 1
                                            ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    Previous
                                </button>

                                <span className="text-gray-700 font-semibold">
                                    Showing {start + 1}–{Math.min(end, totalEntries)} of {totalEntries} entries
                                </span>

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        currentPage === totalPages
                                            ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden w-full max-w-5xl mt-4 sm:mt-6 space-y-4">
                        {loading ? (
                            <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
                                <div className="flex flex-col items-center justify-center">
                                    <Loader size="lg" className="mb-4" />
                                    <p className="text-gray-500">Loading report data...</p>
                                </div>
                            </div>
                        ) : (
                            currentEntries.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all"
                                >
                                    <div className="space-y-3">
                                        {headers.map((header, headerIndex) => {
                                            const cellValue = row[headerIndex] || '';
                                            
                                            return (
                                                <div key={headerIndex} className="flex flex-wrap justify-between items-start">
                                                    <span className="text-sm font-medium text-blue-600 mr-2">
                                                        {String(header)}:
                                                    </span>
                                                    <span className="text-sm text-gray-900 font-medium break-words text-right flex-1 min-w-0">
                                                        {cellValue ? String(cellValue) : '-'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Mobile Pagination */}
                        {totalEntries > 0 && (
                            <div className="flex justify-between items-center px-4 py-4 text-sm text-gray-600">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        currentPage === 1
                                            ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    Previous
                                </button>

                                <span className="text-gray-700 font-semibold text-center">
                                    {start + 1}–{Math.min(end, totalEntries)} of {totalEntries}
                                </span>

                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        currentPage === totalPages
                                            ? "bg-blue-200 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Buttons */}
            <div className="flex flex-row justify-center gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 md:mt-12 w-full max-w-sm sm:max-w-xl px-3 sm:px-4 md:px-0">
                <button
                    onClick={handleCancel}
                    className="btn-cancel px-3 sm:px-4 md:px-6 py-3 rounded-lg w-full sm:w-auto touch-manipulation font-medium text-sm sm:text-base min-h-[44px]"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        if (excelData.length > 0) {
                            setAlertMessage("Excel data saved successfully!");
                            setShowSuccess(true);
                        }
                    }}
                    disabled={excelData.length === 0 || isLoading}
                    className={`btn-confirm px-3 sm:px-4 md:px-6 py-3 rounded-lg w-full sm:w-auto touch-manipulation font-medium text-sm sm:text-base min-h-[44px]
                        ${excelData.length === 0 || isLoading ? "cursor-not-allowed opacity-60" : ""}
                    `}
                >
                    {isLoading ? 'Processing...' : 'Save Data'}
                </button>
            </div>

            {/* Success Alert */}
            {showSuccess && (
                <SweetAlert
                    success
                    title="Success!"
                    confirmBtnText="OK"
                    confirmBtnCssClass="btn-confirm"
                    onConfirm={() => setShowSuccess(false)}
                >
                    {alertMessage}
                </SweetAlert>
            )}
        </div>
    );
}

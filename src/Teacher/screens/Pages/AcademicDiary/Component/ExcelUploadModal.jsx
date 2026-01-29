// ExcelUploadModal.jsx
import React, { useState } from "react";
import { X, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function ExcelUploadModal({ title, onClose, onConfirm }) {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setExcelData(json);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden">

        <div className="flex justify-between px-5 py-4 border-b">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <label className="flex gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer">
            <FileSpreadsheet className="text-green-600" />
            {fileName || "Upload Excel (.xls, .xlsx)"}
            <input hidden type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
          </label>

          {excelData.length > 0 && (
            <table className="w-full text-sm border">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((k) => (
                    <th key={k} className="p-2 border">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, idx) => (
                      <td key={idx} className="p-2 border">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t">
          <button onClick={onClose} className="border px-4 py-2 rounded">Cancel</button>
          <button
            disabled={!excelData.length}
            onClick={() => onConfirm(excelData)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Confirm Upload
          </button>
        </div>
      </div>
    </div>
  );
}

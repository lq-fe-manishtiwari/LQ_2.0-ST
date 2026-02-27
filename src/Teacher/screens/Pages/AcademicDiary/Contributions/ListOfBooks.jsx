import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Download, ChevronDown, UserX } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

/* ----------------------------------
   Input Field Component
----------------------------------- */
const Input = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
    />
  </div>
);

/* ----------------------------------
   Modal Form
----------------------------------- */
const BooksForm = ({ onClose, onSave, initialData }) => {
  const [tableData, setTableData] = useState(
    initialData?.list_of_books_table || [
      { date: "", name_of_book: "", article: "", author: "" },
    ]
  );

  const [documents] = useState(
    initialData?.list_of_books_document || []
  );

  const handleTableChange = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    setTableData(updated);
  };

  const addRow = () => {
    setTableData([
      ...tableData,
      { date: "", name_of_book: "", article: "", author: "" },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      list_of_books_table: tableData,
      list_of_books_document: documents,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Add / Edit Books
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {tableData.map((row, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <Input
                label="Date"
                type="date"
                value={row.date}
                onChange={(e) =>
                  handleTableChange(idx, "date", e.target.value)
                }
              />
              <Input
                label="Name of Book"
                value={row.name_of_book}
                onChange={(e) =>
                  handleTableChange(idx, "name_of_book", e.target.value)
                }
              />
              <Input
                label="Article"
                value={row.article}
                onChange={(e) =>
                  handleTableChange(idx, "article", e.target.value)
                }
              />
              <Input
                label="Author"
                value={row.author}
                onChange={(e) =>
                  handleTableChange(idx, "author", e.target.value)
                }
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
          >
            <Plus size={14} /> Add Row
          </button>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ----------------------------------
   Main Component
----------------------------------- */
const ListOfBooks = () => {

  const userProfile = useUserProfile();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);

  const userId = userProfile.getUserId();
  const teacherId = userProfile.getTeacherId();
  const collegeId = userProfile.getCollegeId();
  const departmentId = userProfile.getDepartmentId();

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCollegeName = () => {
    try {
      const activeCollegeStr = localStorage.getItem("activeCollege");
      if (!activeCollegeStr) return "";
      const activeCollege = JSON.parse(activeCollegeStr);
      return activeCollege?.name || activeCollege?.college_name || "";
    } catch (error) {
      console.error("Error parsing activeCollege:", error);
      return "";
    }
  };
  const collegeName = getCollegeName();

  const getExportData = () => {
    return books.flatMap(book =>
      (book.list_of_books_table || []).map(row => ({
        date: row.date || '-',
        name_of_book: row.name_of_book || '-',
        article: row.article || '-',
        author: row.author || '-'
      }))
    );
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    doc.setFontSize(16);
    doc.text(collegeName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text('List of Books / Journals Referred Report', pageWidth / 2, 22, { align: 'center' });

    const data = getExportData();
    const headers = [['Date', 'Book Name', 'Article', 'Author']];
    const rows = data.map(item => [item.date, item.name_of_book, item.article, item.author]);

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`List_of_Books_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportDropdown(false);
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Books Reference');

      const titleRow0 = worksheet.addRow([collegeName]);
      worksheet.mergeCells(`A1:D1`);
      titleRow0.getCell(1).font = { size: 16, bold: true };
      titleRow0.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      const titleRow = worksheet.addRow(['List of Books / Journals Referred Report']);
      worksheet.mergeCells(`A2:D2`);
      titleRow.getCell(1).font = { size: 14, bold: true };
      titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.addRow([]);

      const headers = ['Date', 'Book Name', 'Article', 'Author'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const data = getExportData();
      data.forEach(item => {
        worksheet.addRow([item.date, item.name_of_book, item.article, item.author]);
      });

      worksheet.columns.forEach(col => { col.width = 25; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `List_of_Books_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      setShowExportDropdown(false);
    } catch (err) {
      console.error('Export Excel failed:', err);
    }
  };

  const handleExportCSV = () => {
    const data = getExportData();
    const headers = ['Date', 'Book Name', 'Article', 'Author'];
    let csvContent = `"${collegeName}"\n`;
    csvContent += `"List of Books / Journals Referred Report"\n\n`;
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

    data.forEach(item => {
      csvContent += [item.date, item.name_of_book, item.article, item.author]
        .map(val => `"${val}"`)
        .join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `List_of_Books_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportDropdown(false);
  };

  const fetchBooks = async () => {
    if (!userId) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching books for userId:", userId);
      const response = await listOfBooksService.getListOfBooksByUserId(userId);

      console.log("API Response:", response);
      if (response && response.content && Array.isArray(response.content)) {
        setBooks(response.content);
      } else if (Array.isArray(response)) {
        setBooks(response);
      } else {
        console.error("Unexpected API response format:", response);
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile.isLoaded && userId) {
      fetchBooks();
    }
  }, [userProfile.isLoaded, userId]);

  const handleSave = async (formData) => {
    try {
      if (!userId) {
        Swal.fire("Error", "User information not available", "error");
        return;
      }

      if (editBook) {
        const bookId = editBook.books_reffered_id || editBook.list_of_books_id;
        await listOfBooksService.updateListOfBooks(
          bookId,
          userId,
          formData
        );
        Swal.fire("Success", "Data updated successfully!", "success");
      } else {
        await listOfBooksService.saveListOfBooks({
          user_id: userId,
          teacher_id: teacherId,
          college_id: collegeId,
          department_id: departmentId,
          ...formData,
        });
        Swal.fire("Success", "Data saved successfully!", "success");
      }

      setShowForm(false);
      setEditBook(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error saving data. Please try again.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      await listOfBooksService.hardDeleteListOfBooks(id);
      fetchBooks();
      Swal.fire("Deleted!", "Record deleted successfully!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Error deleting record. Please try again.", "error");
    }
  };

  if (userProfile.loading) {
    return <p className="text-gray-500">Loading user profile...</p>;
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          List of Books / Journals Referred
        </h2>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowForm(true)}
            disabled={!userId}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors shadow-sm ${!userId
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            <Plus size={16} /> Add Book
          </button>

          {books.length > 0 && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm transition-colors shadow-sm"
              >
                <Download size={16} />
                Export
                <ChevronDown size={14} className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button onClick={handleExportPDF} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-t-lg transition-colors border-b border-gray-100">
                    <Download size={14} className="text-red-500" />
                    Export as PDF
                  </button>
                  <button onClick={handleExportExcel} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100">
                    <Download size={14} className="text-green-600" />
                    Export as Excel
                  </button>
                  <button onClick={handleExportCSV} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-b-lg transition-colors">
                    <Download size={14} className="text-gray-500" />
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading books...</p>
      ) : books.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500 italic mb-2">
            No records available
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Book Name</th>
                <th className="border px-3 py-2">Article</th>
                <th className="border px-3 py-2">Author</th>
                <th className="border px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const bookId = book.books_reffered_id || book.list_of_books_id;

                const bookTable = book.list_of_books_table || [];

                return bookTable.map((row, idx) => (
                  <tr
                    key={`${bookId}-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border px-3 py-2">{row.date || "N/A"}</td>
                    <td className="border px-3 py-2">
                      {row.name_of_book || "N/A"}
                    </td>
                    <td className="border px-3 py-2">{row.article || "N/A"}</td>
                    <td className="border px-3 py-2">{row.author || "N/A"}</td>
                    <td className="border px-3 py-2 flex gap-2">
                      <button
                        onClick={() => {
                          setEditBook(book);
                          setShowForm(true);
                        }}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bookId)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}



      {!userId && (
        <p className="text-xs text-red-500 mt-2">
          Please log in to add books
        </p>
      )}

      {showForm && (
        <BooksForm
          onClose={() => {
            setShowForm(false);
            setEditBook(null);
          }}
          onSave={handleSave}
          initialData={editBook}
        />
      )}
    </div>
  );
};

export default ListOfBooks;
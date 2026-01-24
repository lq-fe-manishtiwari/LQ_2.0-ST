import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { listOfBooksService } from "../Services/listOfBooks.service";
import { useUserProfile } from "../../../../../contexts/UserProfileContext";

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
        alert("User information not available");
        return;
      }

      if (editBook) {
        const bookId = editBook.books_reffered_id || editBook.list_of_books_id;
        await listOfBooksService.updateListOfBooks(
          bookId,
          userId, 
          formData
        );
      } else {
        await listOfBooksService.saveListOfBooks({
          user_id: userId,
          teacher_id: teacherId,
          college_id: collegeId,
          department_id: departmentId,
          ...formData,
        });
      }

      setShowForm(false);
      setEditBook(null);
      fetchBooks();
      alert("Data saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving data. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await listOfBooksService.hardDeleteListOfBooks(id);
      fetchBooks();
      alert("Record deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting record. Please try again.");
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
      </div>

      {loading ? (
        <p className="text-gray-500">Loading books...</p>
      ) : books.length === 0 ? (
        <div>
          <p className="text-sm text-gray-500 italic mb-2">
            No records available for User ID: {userId}
          </p>
          <p className="text-xs text-gray-400">
            College: {collegeId} | Department: {departmentId}
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

      <button
        onClick={() => setShowForm(true)}
        disabled={!userId}
        className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
          !userId 
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <Plus size={16} /> Add Book
      </button>

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
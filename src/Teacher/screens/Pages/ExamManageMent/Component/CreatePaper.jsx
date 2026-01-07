const CreatePaper = ({ dutyId, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-[500px]">
        <h2 className="text-xl font-semibold mb-4">
          Create Question Paper
        </h2>

        <p className="mb-4">
          <strong>Duty ID:</strong> {dutyId}
        </p>

        <p className="text-gray-600">
          Paper creation UI goes here.
        </p>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CreatePaper;

import React from "react";
import CustomSelect from "./CustomSelect";

const QuizIntegration = ({
    formData,
    setFormData,
    options,
    loading,
    addQuizSelection,
    updateQuizSelection,
    removeQuizSelection
}) => {
    // Check if content type is file-based using dynamic content type detection
    const selectedContentType = options.contentTypes.find(ct => ct.value === formData.contentType);
    const contentTypeName = selectedContentType?.full?.content_type_name || selectedContentType?.label || "";
    const isFileType = contentTypeName.toLowerCase().includes("file");
    
    if (!isFileType || !formData.fileUrl) {
        return null;
    }

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-blue-800">Quiz Integration</h3>
                {formData.filePageCount > 0 && (
                    <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        📄 Total Pages: {formData.filePageCount}
                    </span>
                )}
            </div>
            
            <div className="mb-4">
                <p className="text-blue-700 mb-3">Do you want to add quiz in this content?</p>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="addQuizToContent"
                            value="true"
                            checked={formData.addQuizToContent === true}
                            onChange={() => {
                                setFormData(prev => ({ ...prev, addQuizToContent: true }));
                                if (formData.quizSelections.length === 0) {
                                    addQuizSelection();
                                }
                            }}
                            className="mr-2"
                        />
                        Yes
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="addQuizToContent"
                            value="false"
                            checked={formData.addQuizToContent === false}
                            onChange={() => setFormData(prev => ({ ...prev, addQuizToContent: false, quizSelections: [] }))}
                            className="mr-2"
                        />
                        No
                    </label>
                </div>
            </div>

            {formData.addQuizToContent && (
                <div className="space-y-4">
                    {formData.quizSelections.map((quiz, index) => (
                        <div key={quiz.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-800">Quiz #{index + 1}</h4>
                                {formData.quizSelections.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuizSelection(quiz.id)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium mb-1 text-gray-700">
                                        Page Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={quiz.pageNumber}
                                        onChange={(e) => updateQuizSelection(quiz.id, 'pageNumber', e.target.value)}
                                        min="1"
                                        max={formData.filePageCount}
                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                                        placeholder={`Enter page number (1-${formData.filePageCount})`}
                                        required
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Select Quiz"
                                        value={quiz.quizId}
                                        onChange={(value) => updateQuizSelection(quiz.id, 'quizId', value)}
                                        options={options.quizzes || []}
                                        placeholder={options.quizzes?.length > 0 ? "Select Quiz" : "No quizzes available"}
                                        loading={loading.quizzes}
                                        required
                                    />
                                    {/* Debug info */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            Debug: {options.quizzes?.length || 0} quizzes loaded
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button
                        type="button"
                        onClick={addQuizSelection}
                        className="w-full bg-blue-100 text-blue-700 border border-blue-300 rounded-lg py-2 px-4 hover:bg-blue-200 transition-colors"
                    >
                        + Add Another Quiz
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizIntegration;
import { useCallback } from 'react';

export const useQuizManagement = (formData, setFormData) => {
    // Quiz management functions
    const addQuizSelection = useCallback(() => {
        const newQuiz = {
            id: Date.now(), // Unique ID for each quiz selection
            quizId: "",
            pageNumber: ""
        };
        setFormData(prev => ({
            ...prev,
            quizSelections: [...prev.quizSelections, newQuiz]
        }));
    }, [setFormData]);

    const updateQuizSelection = useCallback((id, field, value) => {
        setFormData(prev => ({
            ...prev,
            quizSelections: prev.quizSelections.map(quiz =>
                quiz.id === id ? { ...quiz, [field]: value } : quiz
            )
        }));
    }, [setFormData]);

    const removeQuizSelection = useCallback((id) => {
        setFormData(prev => ({
            ...prev,
            quizSelections: prev.quizSelections.filter(quiz => quiz.id !== id)
        }));
    }, [setFormData]);

    return {
        addQuizSelection,
        updateQuizSelection,
        removeQuizSelection
    };
};
import React, { useState } from 'react';
import AssessmentResultModal from '../Components/AssessmentResultModal';

const ExampleSubmission = () => {
    const [showResultModal, setShowResultModal] = useState(false);
    const [submissionResult, setSubmissionResult] = useState(null);

    const handleSubmitAssessment = async () => {
        try {
            // Your API call to submit assessment
            const response = await fetch('/api/admin/assessment/attempt/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attempt_id: 3,
                    student_id: 40,

                })
            });

            const result = await response.json()
            setSubmissionResult(result);
            setShowResultModal(true);

        } catch (error) {
            console.error('Submission error:', error);
        }
    };

    const handleCloseResultModal = () => {
        setShowResultModal(false);

    };

    return (
        <div>
            {/* Your assessment submission form/UI */}
            <button onClick={handleSubmitAssessment}>
                Create Assessment
            </button>

            {/* Result Modal */}
            <AssessmentResultModal
                isOpen={showResultModal}
                onClose={handleCloseResultModal}
                resultData={submissionResult}
            />
        </div>
    );
};

export default ExampleSubmission;

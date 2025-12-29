import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserProfile } from './UserProfileContext';
import { AluminiService } from '../Student/screens/Pages/Alumini/Service/Alumini.service';

const { getStudentHistory } = AluminiService;

const BatchContext = createContext();

export const useBatch = () => useContext(BatchContext);

export const BatchProvider = ({ children }) => {
    const { profile } = useUserProfile();
    const [batchId, setBatchId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!profile?.student_id) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                const history = await getStudentHistory(profile.student_id);
                const id = history?.[0]?.academic_year?.batch?.batch_id;
                if (!id) throw new Error('Batch not found');
                setBatchId(id);
            } catch (err) {
                console.error('BatchContext Error:', err);
                setError('Failed to fetch batch info');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [profile?.student_id]);

    return (
        <BatchContext.Provider value={{ batchId, loading, error }}>
            {children}
        </BatchContext.Provider>
    );
};

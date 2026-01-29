// src/hooks/useDriveAcademicFilters.js
import { useState, useEffect, useCallback, useMemo } from 'react';


export function useDriveAcademicFilters() {
  const [programOptions, setProgramOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]); // will be dynamic now

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Internal selected program IDs
  const [selectedProgramIds, setSelectedProgramIds] = useState([]);

  // 1. Fetch programs (unchanged)
  useEffect(() => {
    let isMounted = true;s

    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const college = JSON.parse(localStorage.getItem('activeCollege') || '{}');
        let response;

        if (college?.id) {
          console.log('Fetching programs for college ID:', college.id);
          response = await collegeService.getProgramByCollegeId(college.id);
        } else {
          console.log('No college ID → fetching all programs');
          response = await collegeService.getAllprogram();
        }

        if (isMounted && Array.isArray(response)) {
          const formatted = response.map(p => ({
            value: String(p.program_id || p.id || p._id || ''),
            label: p.program_name || p.name || p.program_code || 'Unnamed Program',
          }));
          setProgramOptions(formatted);
        }
      } catch (err) {
        console.error('Programs fetch failed:', err);
      } finally {
        if (isMounted) setLoadingPrograms(false);
      }
    };

    fetchPrograms();
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch batches + extract classes when programs change
  const fetchBatchesAndClasses = useCallback(async (programIds) => {
    if (!Array.isArray(programIds) || programIds.length === 0) {
      console.log('No programs selected → clearing batches & classes');
      setBatchOptions([]);
      setClassOptions([]);
      return;
    }

    console.log('Fetching batches for program IDs:', programIds);
    setLoadingBatches(true);

    try {
      // Assuming batchService.getBatchByProgramId accepts array or comma-separated string
      // Adjust if your service expects different format (e.g. ids.join(','))
      const response = await batchService.getBatchByProgramId(programIds);

      if (!Array.isArray(response)) {
        console.warn('Batches response is not an array:', response);
        setBatchOptions([]);
        setClassOptions([]);
        return;
      }

      // Format batches
      const formattedBatches = response.map(b => ({
        value: String(b.batch_id || b.id || b._id || ''),
        label: b.batch_name || b.batch_code || b.name || 'Unnamed Batch',
      }));
      setBatchOptions(formattedBatches);

      // Extract unique classes from all academic_years → program_class_year → class_year
      const classSet = new Set();

      response.forEach(batch => {
        if (Array.isArray(batch.academic_years)) {
          batch.academic_years.forEach(acYear => {
            if (acYear?.program_class_year?.class_year?.name) {
              classSet.add(acYear.program_class_year.class_year.name);
            }
          });
        }
      });

      // Convert to options format
      const dynamicClasses = Array.from(classSet)
        .sort() // optional: alphabetical sort
        .map(className => ({
          value: className,
          label: className, // can be more descriptive if you have more data
        }));

      setClassOptions(dynamicClasses.length > 0 ? dynamicClasses : [
        // fallback if no classes found in data
        { value: 'First Year', label: 'First Year' },
        { value: 'Second Year', label: 'Second Year' },
        { value: 'Third Year', label: 'Third Year' },
        { value: 'Final Year', label: 'Final Year' },
      ]);

    } catch (err) {
      console.error('Batches & classes fetch failed:', err);
      setBatchOptions([]);
      // Keep fallback classes on error
      setClassOptions([
        { value: 'First Year', label: 'First Year' },
        { value: 'Second Year', label: 'Second Year' },
        { value: 'Third Year', label: 'Third Year' },
        { value: 'Final Year', label: 'Final Year' },
      ]);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  // Trigger fetch when selected programs change
  useEffect(() => {
    fetchBatchesAndClasses(selectedProgramIds);
  }, [selectedProgramIds, fetchBatchesAndClasses]);

  return {
    programOptions,
    batchOptions,
    classOptions,          // now dynamic from API
    loadingPrograms,
    loadingBatches,
    setSelectedProgramIds,
  };
}
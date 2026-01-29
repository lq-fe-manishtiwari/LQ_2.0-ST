'use client';

import React, { useState, useMemo } from 'react';
import { Search, Eye, ArrowLeft, Mail, Phone, GraduationCap, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

/* =======================
   STUDENT DATA (DUMMY)
======================= */
const studentsData = [
  {
    id: 1,
    studentId: 'STU2025001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    phone: '9876543210',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE-A',
    degree: 'B.Tech',
    degreeAggregate: 7.8,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 75,
    aggregateType: '%',
    tenth: 88,
    tenthType: '%',
    twelfth: 84,
    twelfthType: '%',
  },
  {
    id: 2,
    studentId: 'STU2025002',
    name: 'Priya Verma',
    email: 'priya.verma@college.edu',
    phone: '9876543211',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE-B',
    degree: 'B.Tech',
    degreeAggregate: 8.2,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 79,
    aggregateType: '%',
    tenth: 91,
    tenthType: '%',
    twelfth: 88,
    twelfthType: '%',
  },
  {
    id: 3,
    studentId: 'STU2025003',
    name: 'Sneha Iyer',
    email: 'sneha.iyer@college.edu',
    phone: '9876543212',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'AI-DS',
    degree: 'B.Tech',
    degreeAggregate: 8.6,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 83,
    aggregateType: '%',
    tenth: 93,
    tenthType: '%',
    twelfth: 90,
    twelfthType: '%',
  },
  {
    id: 4,
    studentId: 'STU2025004',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@college.edu',
    phone: '9876543213',
    program: 'BCA',
    batch: '2022–2025',
    className: 'BCA-A',
    degree: 'BCA',
    degreeAggregate: 7.4,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 72,
    aggregateType: '%',
    tenth: 85,
    tenthType: '%',
    twelfth: 82,
    twelfthType: '%',
  },
  {
    id: 5,
    studentId: 'STU2025005',
    name: 'Ananya Singh',
    email: 'ananya.singh@college.edu',
    phone: '9876543214',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'IT-A',
    degree: 'B.Tech',
    degreeAggregate: 8.1,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 78,
    aggregateType: '%',
    tenth: 90,
    tenthType: '%',
    twelfth: 86,
    twelfthType: '%',
  },
  {
    id: 6,
    studentId: 'STU2025006',
    name: 'Kunal Patel',
    email: 'kunal.patel@college.edu',
    phone: '9876543215',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'ECE-A',
    degree: 'B.Tech',
    degreeAggregate: 7.9,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 2,
    aggregate: 74,
    aggregateType: '%',
    tenth: 87,
    tenthType: '%',
    twelfth: 80,
    twelfthType: '%',
  },
  {
    id: 7,
    studentId: 'STU2025007',
    name: 'Neha Gupta',
    email: 'neha.gupta@college.edu',
    phone: '9876543216',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE-C',
    degree: 'B.Tech',
    degreeAggregate: 8.4,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 81,
    aggregateType: '%',
    tenth: 92,
    tenthType: '%',
    twelfth: 89,
    twelfthType: '%',
  },
  {
    id: 8,
    studentId: 'STU2025008',
    name: 'Aditya Rao',
    email: 'aditya.rao@college.edu',
    phone: '9876543217',
    program: 'MCA',
    batch: '2023–2025',
    className: 'MCA-A',
    degree: 'MCA',
    degreeAggregate: 8.6,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 84,
    aggregateType: '%',
    tenth: 92,
    tenthType: '%',
    twelfth: 89,
    twelfthType: '%',
  },
  {
    id: 9,
    studentId: 'STU2025009',
    name: 'Pooja Nair',
    email: 'pooja.nair@college.edu',
    phone: '9876543218',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA-A',
    degree: 'MBA',
    degreeAggregate: 8.7,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 85,
    aggregateType: '%',
    tenth: 94,
    tenthType: '%',
    twelfth: 91,
    twelfthType: '%',
  },
  {
    id: 10,
    studentId: 'STU2025010',
    name: 'Vikas Yadav',
    email: 'vikas.yadav@college.edu',
    phone: '9876543219',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'MECH-A',
    degree: 'B.Tech',
    degreeAggregate: 7.2,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 3,
    aggregate: 70,
    aggregateType: '%',
    tenth: 82,
    tenthType: '%',
    twelfth: 78,
    twelfthType: '%',
  },

  {
    id: 11,
    studentId: 'STU2025011',
    name: 'Ishita Malhotra',
    email: 'ishita.malhotra@college.edu',
    phone: '9876543220',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE-A',
    degree: 'B.Tech',
    degreeAggregate: 8.3,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 80,
    aggregateType: '%',
    tenth: 91,
    tenthType: '%',
    twelfth: 87,
    twelfthType: '%',
  },
  {
    id: 12,
    studentId: 'STU2025012',
    name: 'Rahul Khanna',
    email: 'rahul.khanna@college.edu',
    phone: '9876543221',
    program: 'M.Tech',
    batch: '2023–2025',
    className: 'MTECH-CSE',
    degree: 'M.Tech',
    degreeAggregate: 8.1,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 79,
    aggregateType: '%',
    tenth: 89,
    tenthType: '%',
    twelfth: 86,
    twelfthType: '%',
  },
  {
    id: 13,
    studentId: 'STU2025013',
    name: 'Simran Kaur',
    email: 'simran.kaur@college.edu',
    phone: '9876543222',
    program: 'BCA',
    batch: '2022–2025',
    className: 'BCA-B',
    degree: 'BCA',
    degreeAggregate: 7.9,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 76,
    aggregateType: '%',
    tenth: 88,
    tenthType: '%',
    twelfth: 84,
    twelfthType: '%',
  },
  {
    id: 14,
    studentId: 'STU2025014',
    name: 'Arjun Das',
    email: 'arjun.das@college.edu',
    phone: '9876543223',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'IT-B',
    degree: 'B.Tech',
    degreeAggregate: 7.5,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 2,
    aggregate: 71,
    aggregateType: '%',
    tenth: 84,
    tenthType: '%',
    twelfth: 80,
    twelfthType: '%',
  },
  {
    id: 15,
    studentId: 'STU2025015',
    name: 'Mehul Jain',
    email: 'mehul.jain@college.edu',
    phone: '9876543224',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA-B',
    degree: 'MBA',
    degreeAggregate: 8.5,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 82,
    aggregateType: '%',
    tenth: 92,
    tenthType: '%',
    twelfth: 89,
    twelfthType: '%',
  },

  {
    id: 16,
    studentId: 'STU2025016',
    name: 'Riya Chatterjee',
    email: 'riya.chatterjee@college.edu',
    phone: '9876543225',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE-B',
    degree: 'B.Tech',
    degreeAggregate: 8.6,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 84,
    aggregateType: '%',
    tenth: 94,
    tenthType: '%',
    twelfth: 92,
    twelfthType: '%',
  },
  {
    id: 17,
    studentId: 'STU2025017',
    name: 'Amit Kulkarni',
    email: 'amit.kulkarni@college.edu',
    phone: '9876543226',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'MECH-B',
    degree: 'B.Tech',
    degreeAggregate: 7.3,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 69,
    aggregateType: '%',
    tenth: 81,
    tenthType: '%',
    twelfth: 79,
    twelfthType: '%',
  },
  {
    id: 18,
    studentId: 'STU2025018',
    name: 'Kavya Reddy',
    email: 'kavya.reddy@college.edu',
    phone: '9876543227',
    program: 'MCA',
    batch: '2023–2025',
    className: 'MCA-B',
    degree: 'MCA',
    degreeAggregate: 8.2,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 79,
    aggregateType: '%',
    tenth: 90,
    tenthType: '%',
    twelfth: 88,
    twelfthType: '%',
  },
  {
    id: 19,
    studentId: 'STU2025019',
    name: 'Siddharth Bose',
    email: 'siddharth.bose@college.edu',
    phone: '9876543228',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'ECE-B',
    degree: 'B.Tech',
    degreeAggregate: 7.7,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 2,
    aggregate: 73,
    aggregateType: '%',
    tenth: 86,
    tenthType: '%',
    twelfth: 82,
    twelfthType: '%',
  },
  {
    id: 20,
    studentId: 'STU2025020',
    name: 'Nidhi Agarwal',
    email: 'nidhi.agarwal@college.edu',
    phone: '9876543229',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA-A',
    degree: 'MBA',
    degreeAggregate: 8.8,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 86,
    aggregateType: '%',
    tenth: 95,
    tenthType: '%',
    twelfth: 93,
    twelfthType: '%',
  },

  {
    id: 21,
    studentId: 'STU2025021',
    name: 'Harsh Vardhan',
    email: 'harsh.vardhan@college.edu',
    phone: '9876543230',
    program: 'BCA',
    batch: '2022–2025',
    className: 'BCA-A',
    degree: 'BCA',
    degreeAggregate: 7.1,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 2,
    aggregate: 68,
    aggregateType: '%',
    tenth: 80,
    tenthType: '%',
    twelfth: 76,
    twelfthType: '%',
  },
  {
    id: 22,
    studentId: 'STU2025022',
    name: 'Tanvi Joshi',
    email: 'tanvi.joshi@college.edu',
    phone: '9876543231',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'AI-ML',
    degree: 'B.Tech',
    degreeAggregate: 8.4,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 82,
    aggregateType: '%',
    tenth: 92,
    tenthType: '%',
    twelfth: 89,
    twelfthType: '%',
  },
  {
    id: 23,
    studentId: 'STU2025023',
    name: 'Manish Pandey',
    email: 'manish.pandey@college.edu',
    phone: '9876543232',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'IT-C',
    degree: 'B.Tech',
    degreeAggregate: 7.6,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 74,
    aggregateType: '%',
    tenth: 85,
    tenthType: '%',
    twelfth: 81,
    twelfthType: '%',
  },
  {
    id: 24,
    studentId: 'STU2025024',
    name: 'Aishwarya Pillai',
    email: 'aishwarya.pillai@college.edu',
    phone: '9876543233',
    program: 'M.Tech',
    batch: '2023–2025',
    className: 'MTECH-AI',
    degree: 'M.Tech',
    degreeAggregate: 8.9,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 87,
    aggregateType: '%',
    tenth: 96,
    tenthType: '%',
    twelfth: 94,
    twelfthType: '%',
  },
  {
    id: 25,
    studentId: 'STU2025025',
    name: 'Deepak Soni',
    email: 'deepak.soni@college.edu',
    phone: '9876543234',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'MECH-C',
    degree: 'B.Tech',
    degreeAggregate: 7.0,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 2,
    aggregate: 67,
    aggregateType: '%',
    tenth: 79,
    tenthType: '%',
    twelfth: 75,
    twelfthType: '%',
  },

  {
    id: 26,
    studentId: 'STU2025026',
    name: 'Shreya Mukherjee',
    email: 'shreya.mukherjee@college.edu',
    phone: '9876543235',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA-B',
    degree: 'MBA',
    degreeAggregate: 8.1,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 78,
    aggregateType: '%',
    tenth: 90,
    tenthType: '%',
    twelfth: 87,
    twelfthType: '%',
  },
  {
    id: 27,
    studentId: 'STU2025027',
    name: 'Naveen Kumar',
    email: 'naveen.kumar@college.edu',
    phone: '9876543236',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'ECE-C',
    degree: 'B.Tech',
    degreeAggregate: 7.4,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 71,
    aggregateType: '%',
    tenth: 83,
    tenthType: '%',
    twelfth: 79,
    twelfthType: '%',
  },
  {
    id: 28,
    studentId: 'STU2025028',
    name: 'Rashmi Kulkarni',
    email: 'rashmi.kulkarni@college.edu',
    phone: '9876543237',
    program: 'BCA',
    batch: '2022–2025',
    className: 'BCA-C',
    degree: 'BCA',
    degreeAggregate: 8.5,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 83,
    aggregateType: '%',
    tenth: 93,
    tenthType: '%',
    twelfth: 91,
    twelfthType: '%',
  },
  {
    id: 29,
    studentId: 'STU2025029',
    name: 'Mohit Arora',
    email: 'mohit.arora@college.edu',
    phone: '9876543238',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE-D',
    degree: 'B.Tech',
    degreeAggregate: 7.8,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 75,
    aggregateType: '%',
    tenth: 87,
    tenthType: '%',
    twelfth: 84,
    twelfthType: '%',
  },
  {
    id: 30,
    studentId: 'STU2025030',
    name: 'Ritika Sen',
    email: 'ritika.sen@college.edu',
    phone: '9876543239',
    program: 'MCA',
    batch: '2023–2025',
    className: 'MCA-C',
    degree: 'MCA',
    degreeAggregate: 8.6,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 84,
    aggregateType: '%',
    tenth: 92,
    tenthType: '%',
    twelfth: 89,
    twelfthType: '%',
  },
  {
    id: 31,
    studentId: 'STU2025031',
    name: 'Saurabh Mishra',
    email: 'saurabh.mishra@college.edu',
    phone: '9876543240',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'IT-D',
    degree: 'B.Tech',
    degreeAggregate: 7.9,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 1,
    aggregate: 75,
    aggregateType: '%',
    tenth: 86,
    tenthType: '%',
    twelfth: 83,
    twelfthType: '%',
  },
  {
    id: 32,
    studentId: 'STU2025032',
    name: 'Ankita Roy',
    email: 'ankita.roy@college.edu',
    phone: '9876543241',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'AI-DS-B',
    degree: 'B.Tech',
    degreeAggregate: 8.8,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 86,
    aggregateType: '%',
    tenth: 94,
    tenthType: '%',
    twelfth: 92,
    twelfthType: '%',
  },
  {
    id: 33,
    studentId: 'STU2025033',
    name: 'Karthik R',
    email: 'karthik.r@college.edu',
    phone: '9876543242',
    program: 'M.Tech',
    batch: '2023–2025',
    className: 'MTECH-DS',
    degree: 'M.Tech',
    degreeAggregate: 8.3,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 81,
    aggregateType: '%',
    tenth: 90,
    tenthType: '%',
    twelfth: 88,
    twelfthType: '%',
  },
  {
    id: 34,
    studentId: 'STU2025034',
    name: 'Neeraj Singh',
    email: 'neeraj.singh@college.edu',
    phone: '9876543243',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'ECE-D',
    degree: 'B.Tech',
    degreeAggregate: 7.5,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 2,
    aggregate: 72,
    aggregateType: '%',
    tenth: 84,
    tenthType: '%',
    twelfth: 80,
    twelfthType: '%',
  },
  {
    id: 35,
    studentId: 'STU2025035',
    name: 'Pallavi Deshmukh',
    email: 'pallavi.deshmukh@college.edu',
    phone: '9876543244',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA-C',
    degree: 'MBA',
    degreeAggregate: 8.9,
    degreeAggregateType: 'CGPA',
    degreeClosedBacklogs: 0,
    aggregate: 88,
    aggregateType: '%',
    tenth: 93,
    tenthType: '%',
    twelfth: 91,
    twelfthType: '%',
  },
];


/* =======================
   MAIN COMPONENT
======================= */
export default function StudentListWithProfile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const paginatedData = useMemo(() => {
    let list = studentsData;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.program.toLowerCase().includes(q) ||
          s.batch.toLowerCase().includes(q)
      );
    }

    const totalEntries = list.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = list.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end, allData: list };
  }, [searchTerm, currentPage]);

  const { currentEntries, totalEntries, totalPages, allData } = paginatedData;

  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
  const resetPage = () => setCurrentPage(1);

  const exportToExcel = () => {
  const excelData = allData.map(s => ({
    'Student ID': s.studentId,
    'Student Name': s.name,
    'Program': s.program,
    'Batch': s.batch,
    'Class': s.className,
    'Degree': s.degree,
    'Degree Aggregate': s.degreeAggregate,
    'Degree Aggregate Type': s.degreeAggregateType,
    'Closed Backlogs': s.degreeClosedBacklogs,
    'Overall Aggregate': s.aggregate,
    'Aggregate Type': s.aggregateType,
    '10th Score': s.tenth,
    '10th Type': s.tenthType,
    '12th Score': s.twelfth,
    '12th Type': s.twelfthType,
    'Email': s.email,
    'Phone': s.phone,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  /* Header styling */
  const headerCells = Object.keys(excelData[0]);
  headerCells.forEach((_, index) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
    if (!worksheet[cellAddress]) return;
    worksheet[cellAddress].s = {
      font: { bold: true },
      alignment: { vertical: 'center', horizontal: 'center' },
    };
  });

  /* Auto column width */
  worksheet['!cols'] = headerCells.map(header => ({
    wch: Math.max(header.length + 2, 18),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Academic Data');

  XLSX.writeFile(workbook, 'Student_Academic_Data.xlsx');
};


  /* =======================
     PROFILE VIEW
  ======================= */
  if (selectedStudent) {
    return (
      <div className="p-6 space-y-6">
        <button
          onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Student List
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedStudent.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedStudent.program} • {selectedStudent.batch} • {selectedStudent.className}
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {selectedStudent.studentId}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
            <InfoItem icon={<Mail />} text={selectedStudent.email} />
            <InfoItem icon={<Phone />} text={selectedStudent.phone} />
            <InfoItem icon={<GraduationCap />} text={selectedStudent.degree} />
          </div>
        </div>

        {/* Academic Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Academic Performance
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Degree Aggregate" value={`${selectedStudent.degreeAggregate}${selectedStudent.degreeAggregateType}`} />
            <StatCard title="Overall Aggregate" value={`${selectedStudent.aggregate}${selectedStudent.aggregateType}`} />
            <StatCard title="10th" value={`${selectedStudent.tenth}${selectedStudent.tenthType}`} />
            <StatCard title="12th" value={`${selectedStudent.twelfth}${selectedStudent.twelfthType}`} />
          </div>

          <div className="mt-6">
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${
              selectedStudent.degreeClosedBacklogs === 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              Closed Backlogs: {selectedStudent.degreeClosedBacklogs}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* =======================
     LIST VIEW (ALL COLUMNS)
  ======================= */
  return (
    <div className="p-0 md:p-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Search students"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPage();
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-sm transition-all font-medium flex-1 sm:flex-none sm:w-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* ────────────────────── Desktop Table ────────────────────── */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto blue-scrollbar">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Degree</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Degree Aggregate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Backlogs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Aggregate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">10th</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">12th</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 tracking-wider">Type</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-50 tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.length > 0 ? (
                currentEntries.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4 text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                      onClick={() => setSelectedStudent(student)}
                    >
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.program}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.batch}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.className}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.degree}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.degreeAggregate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.degreeAggregateType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.degreeClosedBacklogs === 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.degreeClosedBacklogs}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.aggregate}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.aggregateType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.tenth}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.tenthType}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.twelfth}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.twelfthType}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? `No students found matching your search` : "No students found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination */}
        {totalEntries > 0 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Showing {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries} entries
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ────────────────────── Mobile Cards ────────────────────── */}
      <div className="lg:hidden space-y-4">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No students found</p>
              <p className="text-sm">
                {searchTerm ? `No students found matching your search` : "No students available."}
              </p>
            </div>
          </div>
        ) : (
          currentEntries.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p
                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedStudent(student)}
                  >
                    {student.name}
                  </p>
                  <p className="text-sm text-gray-500">{student.studentId}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  student.degreeClosedBacklogs === 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  Backlogs: {student.degreeClosedBacklogs}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Program:</span> {student.program}</div>
                  <div><span className="font-medium">Batch:</span> {student.batch}</div>
                  <div><span className="font-medium">Class:</span> {student.className}</div>
                  <div><span className="font-medium">Degree:</span> {student.degree}</div>
                  <div><span className="font-medium">Degree Agg:</span> {student.degreeAggregate}{student.degreeAggregateType}</div>
                  <div><span className="font-medium">Overall Agg:</span> {student.aggregate}{student.aggregateType}</div>
                  <div><span className="font-medium">10th:</span> {student.tenth}{student.tenthType}</div>
                  <div><span className="font-medium">12th:</span> {student.twelfth}{student.twelfthType}</div>
                </div>
              </div>

              <div className="flex justify-end items-center">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">View Details</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mobile Pagination */}
      {totalEntries > 0 && (
        <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium text-xs">
            {paginatedData.start + 1}–{Math.min(paginatedData.end, totalEntries)} of {totalEntries}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {totalEntries === 0 && (
        <div className="hidden lg:block text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600">No students found matching your search.</p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                resetPage();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* =======================
   SMALL COMPONENTS
======================= */
const StatCard = ({ title, value }) => (
  <div className="border rounded-lg p-4 text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-bold mt-1">{value}</p>
  </div>
);

const InfoItem = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-gray-700">
    <span className="w-4 h-4 text-gray-400">{icon}</span>
    {text}
  </div>
);

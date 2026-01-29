'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Mail,
  Phone,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

/* ===============================
   CONSTANTS
================================ */
const VIEWS = {
  LIST: 'list',
  STUDENTS: 'students',
  PROFILE: 'profile',
};

const CATEGORIES = ['eligible', 'registered', 'approved', 'shortlisted'];

/* ===============================
   DUMMY STUDENT DATA
================================ */
const students = [
  { id: 1, name: 'Aarav Sharma', program: 'B.Tech', batch: '2021–2025', className: 'CSE-A', email: 'aarav.sharma@college.edu', phone: '9876543210', aggregate: 75 },
  { id: 2, name: 'Priya Verma', program: 'B.Tech', batch: '2021–2025', className: 'CSE-B', email: 'priya.verma@college.edu', phone: '9876543211', aggregate: 79 },
  { id: 3, name: 'Sneha Iyer', program: 'B.Tech', batch: '2021–2025', className: 'AI-DS', email: 'sneha.iyer@college.edu', phone: '9876543212', aggregate: 83 },
  { id: 4, name: 'Rohit Mehta', program: 'BCA', batch: '2022–2025', className: 'BCA-A', email: 'rohit.mehta@college.edu', phone: '9876543213', aggregate: 72 },
  { id: 5, name: 'Ananya Singh', program: 'B.Tech', batch: '2021–2025', className: 'IT-A', email: 'ananya.singh@college.edu', phone: '9876543214', aggregate: 78 },
  { id: 6, name: 'Kunal Patel', program: 'B.Tech', batch: '2021–2025', className: 'ECE-A', email: 'kunal.patel@college.edu', phone: '9876543215', aggregate: 74 },
  { id: 7, name: 'Neha Gupta', program: 'B.Tech', batch: '2021–2025', className: 'CSE-C', email: 'neha.gupta@college.edu', phone: '9876543216', aggregate: 81 },
  { id: 8, name: 'Aditya Rao', program: 'MCA', batch: '2023–2025', className: 'MCA-A', email: 'aditya.rao@college.edu', phone: '9876543217', aggregate: 84 },
  { id: 9, name: 'Pooja Nair', program: 'MBA', batch: '2023–2025', className: 'MBA-A', email: 'pooja.nair@college.edu', phone: '9876543218', aggregate: 85 },
  { id: 10, name: 'Vikas Yadav', program: 'B.Tech', batch: '2021–2025', className: 'MECH-A', email: 'vikas.yadav@college.edu', phone: '9876543219', aggregate: 70 },
  { id: 11, name: 'Ishita Malhotra', program: 'B.Tech', batch: '2021–2025', className: 'CSE-A', email: 'ishita.malhotra@college.edu', phone: '9876543220', aggregate: 80 },
  { id: 12, name: 'Rahul Khanna', program: 'M.Tech', batch: '2023–2025', className: 'MTECH-CSE', email: 'rahul.khanna@college.edu', phone: '9876543221', aggregate: 79 },
  { id: 13, name: 'Simran Kaur', program: 'BCA', batch: '2022–2025', className: 'BCA-B', email: 'simran.kaur@college.edu', phone: '9876543222', aggregate: 76 },
  { id: 14, name: 'Arjun Das', program: 'B.Tech', batch: '2021–2025', className: 'IT-B', email: 'arjun.das@college.edu', phone: '9876543223', aggregate: 71 },
  { id: 15, name: 'Mehul Jain', program: 'MBA', batch: '2023–2025', className: 'MBA-B', email: 'mehul.jain@college.edu', phone: '9876543224', aggregate: 82 },
  { id: 16, name: 'Riya Chatterjee', program: 'B.Tech', batch: '2021–2025', className: 'CSE-B', email: 'riya.chatterjee@college.edu', phone: '9876543225', aggregate: 84 },
  { id: 17, name: 'Amit Kulkarni', program: 'B.Tech', batch: '2021–2025', className: 'MECH-B', email: 'amit.kulkarni@college.edu', phone: '9876543226', aggregate: 69 },
  { id: 18, name: 'Kavya Reddy', program: 'MCA', batch: '2023–2025', className: 'MCA-B', email: 'kavya.reddy@college.edu', phone: '9876543227', aggregate: 79 },
  { id: 19, name: 'Siddharth Bose', program: 'B.Tech', batch: '2021–2025', className: 'ECE-B', email: 'siddharth.bose@college.edu', phone: '9876543228', aggregate: 73 },
  { id: 20, name: 'Nidhi Agarwal', program: 'MBA', batch: '2023–2025', className: 'MBA-A', email: 'nidhi.agarwal@college.edu', phone: '9876543229', aggregate: 86 },
  { id: 21, name: 'Harsh Vardhan', program: 'BCA', batch: '2022–2025', className: 'BCA-A', email: 'harsh.vardhan@college.edu', phone: '9876543230', aggregate: 68 },
  { id: 22, name: 'Tanvi Joshi', program: 'B.Tech', batch: '2021–2025', className: 'AI-ML', email: 'tanvi.joshi@college.edu', phone: '9876543231', aggregate: 82 },
  { id: 23, name: 'Manish Pandey', program: 'B.Tech', batch: '2021–2025', className: 'IT-C', email: 'manish.pandey@college.edu', phone: '9876543232', aggregate: 74 },
  { id: 24, name: 'Aishwarya Pillai', program: 'M.Tech', batch: '2023–2025', className: 'MTECH-AI', email: 'aishwarya.pillai@college.edu', phone: '9876543233', aggregate: 87 },
  { id: 25, name: 'Deepak Soni', program: 'B.Tech', batch: '2021–2025', className: 'MECH-C', email: 'deepak.soni@college.edu', phone: '9876543234', aggregate: 67 },
];


/* ===============================
   PLACEMENT DATA
================================ */
const placementData = [
  {
    id: 'PL001',
    company: 'TCS',
    jobTitle: 'Software Engineer',
    registrationStatus: 'Open',
    driveSchedule: '25 Jun 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / IT',
    minCTC: '3.5 LPA',
    maxCTC: '7 LPA',
    maxFixed: '6 LPA',
    stipend: '15,000',
    eligible: [1,2,3,5,6,7,8,9,10,11,12,14,16,18,19,20,22,23,24,25],
    registered: [1,2,3,5,7,11,16,20,22,23,24],
    approved: [1,3,7,11,16,22],
    shortlisted: [3,7,16],
  },
  {
    id: 'PL002',
    company: 'Infosys',
    jobTitle: 'System Engineer',
    registrationStatus: 'Closed',
    driveSchedule: '10 Jul 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / AI',
    minCTC: '4 LPA',
    maxCTC: '8 LPA',
    maxFixed: '7 LPA',
    stipend: '20,000',
    eligible: [1,2,3,5,7,8,9,11,12,14,16,18,19,20,22,23,24,25,6,10],
    registered: [2,5,7,11,16,22,24,9],
    approved: [5,11,16,22],
    shortlisted: [11,22],
  },
  {
    id: 'PL003',
    company: 'Wipro',
    jobTitle: 'Project Engineer',
    registrationStatus: 'Open',
    driveSchedule: '18 Jul 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / ECE',
    minCTC: '3.2 LPA',
    maxCTC: '6 LPA',
    maxFixed: '5.5 LPA',
    stipend: '12,000',
    eligible: [1,2,3,5,6,7,10,11,14,16,17,19,22,23,25,8,9,12,18,20],
    registered: [1,3,6,7,11,16,22,23],
    approved: [3,7,11],
    shortlisted: [7],
  },
  {
    id: 'PL004',
    company: 'Accenture',
    jobTitle: 'Associate Engineer',
    registrationStatus: 'Open',
    driveSchedule: '22 Jul 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / IT / AI',
    minCTC: '4.5 LPA',
    maxCTC: '9 LPA',
    maxFixed: '8 LPA',
    stipend: '18,000',
    eligible: [1,2,3,5,7,8,9,11,12,15,16,18,20,22,23,24,6,10,14,19],
    registered: [1,2,3,7,11,16,20,22,24],
    approved: [3,11,16,22],
    shortlisted: [16],
  },
  {
    id: 'PL005',
    company: 'Capgemini',
    jobTitle: 'Analyst',
    registrationStatus: 'Closed',
    driveSchedule: '30 Jul 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / IT',
    minCTC: '4 LPA',
    maxCTC: '7.5 LPA',
    maxFixed: '6.5 LPA',
    stipend: '15,000',
    eligible: [1,2,3,5,7,11,14,16,22,23,6,8,9,12,18,19,20,24,10,25],
    registered: [2,5,7,11,16,22,23],
    approved: [7,11,16],
    shortlisted: [11],
  },
  {
    id: 'PL006',
    company: 'Cognizant',
    jobTitle: 'Programmer Analyst',
    registrationStatus: 'Open',
    driveSchedule: '05 Aug 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / IT',
    minCTC: '4.2 LPA',
    maxCTC: '8 LPA',
    maxFixed: '7 LPA',
    stipend: '18,000',
    eligible: [1,2,3,5,7,8,9,11,12,14,16,18,20,22,23,24,6,10,19,25],
    registered: [1,3,7,11,16,22,24],
    approved: [3,11,16],
    shortlisted: [16],
  },
  {
    id: 'PL007',
    company: 'Deloitte',
    jobTitle: 'Business Analyst',
    registrationStatus: 'Open',
    driveSchedule: '08 Aug 2025',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA',
    minCTC: '6 LPA',
    maxCTC: '12 LPA',
    maxFixed: '10 LPA',
    stipend: '25,000',
    eligible: [9,15,20,8,12,18,24,3,7,11,16,22,1,2,5,14,23,6,19,10],
    registered: [9,15,20,11,16,22],
    approved: [9,20,16],
    shortlisted: [20],
  },
  {
    id: 'PL008',
    company: 'HCL',
    jobTitle: 'Graduate Engineer',
    registrationStatus: 'Closed',
    driveSchedule: '12 Aug 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / ECE',
    minCTC: '3.8 LPA',
    maxCTC: '6.5 LPA',
    maxFixed: '6 LPA',
    stipend: '14,000',
    eligible: [1,2,3,5,6,7,10,11,14,16,17,19,22,23,25,8,9,12,18,20],
    registered: [2,6,7,11,16,22],
    approved: [7,11],
    shortlisted: [11],
  },
  {
    id: 'PL009',
    company: 'Tech Mahindra',
    jobTitle: 'Associate Software Engineer',
    registrationStatus: 'Open',
    driveSchedule: '15 Aug 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / IT',
    minCTC: '3.6 LPA',
    maxCTC: '6.8 LPA',
    maxFixed: '6 LPA',
    stipend: '13,000',
    eligible: [1,2,3,5,7,11,14,16,22,23,6,8,9,12,18,19,20,24,10,25],
    registered: [1,3,7,11,16,22],
    approved: [7,11],
    shortlisted: [11],
  },
  {
    id: 'PL010',
    company: 'IBM',
    jobTitle: 'Data Engineer',
    registrationStatus: 'Open',
    driveSchedule: '18 Aug 2025',
    program: 'B.Tech / M.Tech',
    batch: '2021–2025',
    className: 'CSE / AI',
    minCTC: '6 LPA',
    maxCTC: '12 LPA',
    maxFixed: '10 LPA',
    stipend: '30,000',
    eligible: [3,7,11,16,22,24,12,8,18,9,20,1,2,5,14,23,6,19,10,25],
    registered: [3,7,11,16,22,24],
    approved: [7,11,16],
    shortlisted: [16],
  },

  {
    id: 'PL011',
    company: 'Amazon',
    jobTitle: 'SDE-1',
    registrationStatus: 'Open',
    driveSchedule: '22 Aug 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / AI',
    minCTC: '18 LPA',
    maxCTC: '35 LPA',
    maxFixed: '28 LPA',
    stipend: '80,000',
    eligible: [3,7,11,16,22,24,20,9,12,8,18,1,2,5,14,23,6,19,10,25],
    registered: [3,7,11,16,22],
    approved: [7,16],
    shortlisted: [16],
  },
  {
    id: 'PL012',
    company: 'Flipkart',
    jobTitle: 'Software Engineer',
    registrationStatus: 'Closed',
    driveSchedule: '25 Aug 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE',
    minCTC: '16 LPA',
    maxCTC: '30 LPA',
    maxFixed: '25 LPA',
    stipend: '70,000',
    eligible: [3,7,11,16,22,24,20,9,12,8,18,1,2,5,14,23,6,19,10,25],
    registered: [7,11,16,22],
    approved: [11,16],
    shortlisted: [16],
  },
  {
    id: 'PL013',
    company: 'Zoho',
    jobTitle: 'Member Technical Staff',
    registrationStatus: 'Open',
    driveSchedule: '28 Aug 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / IT',
    minCTC: '8 LPA',
    maxCTC: '15 LPA',
    maxFixed: '12 LPA',
    stipend: '40,000',
    eligible: [1,2,3,5,7,11,16,22,23,24,6,8,9,12,18,20,10,14,19,25],
    registered: [3,7,11,16,22],
    approved: [7,16],
    shortlisted: [16],
  },
  {
    id: 'PL014',
    company: 'L&T',
    jobTitle: 'Graduate Trainee',
    registrationStatus: 'Closed',
    driveSchedule: '02 Sep 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'MECH / ECE',
    minCTC: '4 LPA',
    maxCTC: '7 LPA',
    maxFixed: '6 LPA',
    stipend: '15,000',
    eligible: [6,10,17,19,25,14,23,1,2,3,5,7,11,16,22,8,9,12,18,20],
    registered: [6,10,19,25],
    approved: [19],
    shortlisted: [19],
  },
  {
    id: 'PL015',
    company: 'SAP',
    jobTitle: 'Associate Consultant',
    registrationStatus: 'Open',
    driveSchedule: '05 Sep 2025',
    program: 'B.Tech / MBA',
    batch: '2021–2025',
    className: 'CSE / MBA',
    minCTC: '10 LPA',
    maxCTC: '18 LPA',
    maxFixed: '15 LPA',
    stipend: '35,000',
    eligible: [3,7,11,16,22,20,15,9,12,8,18,1,2,5,14,23,6,19,10,25],
    registered: [3,7,11,16,20],
    approved: [7,16],
    shortlisted: [16],
  },
  {
    id: 'PL016',
    company: 'Oracle',
    jobTitle: 'Cloud Engineer',
    registrationStatus: 'Open',
    driveSchedule: '08 Sep 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'CSE / AI',
    minCTC: '12 LPA',
    maxCTC: '20 LPA',
    maxFixed: '17 LPA',
    stipend: '45,000',
    eligible: [3,7,11,16,22,24,12,8,18,9,20,1,2,5,14,23,6,19,10,25],
    registered: [7,11,16,22],
    approved: [11,16],
    shortlisted: [16],
  },
  {
    id: 'PL017',
    company: 'Siemens',
    jobTitle: 'Automation Engineer',
    registrationStatus: 'Closed',
    driveSchedule: '12 Sep 2025',
    program: 'B.Tech',
    batch: '2021–2025',
    className: 'ECE / MECH',
    minCTC: '5 LPA',
    maxCTC: '9 LPA',
    maxFixed: '8 LPA',
    stipend: '18,000',
    eligible: [6,10,17,19,25,14,23,1,2,3,5,7,11,16,22,8,9,12,18,20],
    registered: [6,10,19],
    approved: [19],
    shortlisted: [19],
  },
  {
    id: 'PL018',
    company: 'EY',
    jobTitle: 'Consultant',
    registrationStatus: 'Open',
    driveSchedule: '15 Sep 2025',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA',
    minCTC: '7 LPA',
    maxCTC: '14 LPA',
    maxFixed: '12 LPA',
    stipend: '22,000',
    eligible: [9,15,20,8,12,18,24,3,7,11,16,22,1,2,5,14,23,6,19,10],
    registered: [9,15,20,16],
    approved: [20],
    shortlisted: [20],
  },
  {
    id: 'PL019',
    company: 'KPMG',
    jobTitle: 'Audit Associate',
    registrationStatus: 'Closed',
    driveSchedule: '18 Sep 2025',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA',
    minCTC: '6.5 LPA',
    maxCTC: '12 LPA',
    maxFixed: '10 LPA',
    stipend: '20,000',
    eligible: [9,15,20,8,12,18,24,3,7,11,16,22,1,2,5,14,23,6,19,10],
    registered: [9,20,15],
    approved: [20],
    shortlisted: [20],
  },
  {
    id: 'PL020',
    company: 'PwC',
    jobTitle: 'Associate Consultant',
    registrationStatus: 'Open',
    driveSchedule: '22 Sep 2025',
    program: 'MBA',
    batch: '2023–2025',
    className: 'MBA',
    minCTC: '7.5 LPA',
    maxCTC: '15 LPA',
    maxFixed: '13 LPA',
    stipend: '24,000',
    eligible: [9,15,20,8,12,18,24,3,7,11,16,22,1,2,5,14,23,6,19,10],
    registered: [9,15,20,16],
    approved: [20,16],
    shortlisted: [20],
  },
];


/* ===============================
   MAIN COMPONENT
================================ */
export default function StudentPlacementData() {
  const [view, setView] = useState(VIEWS.LIST);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Pagination state for main list
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Pagination state for student list
  const [studentPage, setStudentPage] = useState(1);
  const studentsPerPage = 10;

  // Paginated data
  const paginatedData = useMemo(() => {
    const totalEntries = placementData.length;
    const totalPages = Math.ceil(totalEntries / entriesPerPage);
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const currentEntries = placementData.slice(start, end);

    return { currentEntries, totalEntries, totalPages, start, end };
  }, [currentPage]);

  const { currentEntries, totalEntries, totalPages } = paginatedData;

  // Derived state: Memoized student list based on selected drive and category
  const studentList = useMemo(() => {
    if (!selectedDrive || !selectedCategory) return [];
    return students.filter(s =>
      selectedDrive[selectedCategory].includes(s.id)
    );
  }, [selectedDrive, selectedCategory]);

  // Paginated student list
  const paginatedStudents = useMemo(() => {
    const totalStudents = studentList.length;
    const totalPages = Math.ceil(totalStudents / studentsPerPage);
    const start = (studentPage - 1) * studentsPerPage;
    const end = start + studentsPerPage;
    const currentStudents = studentList.slice(start, end);

    return { currentStudents, totalStudents, totalPages, start, end };
  }, [studentList, studentPage]);

  // Pagination handlers
  const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);

  const handleStudentPrev = () => studentPage > 1 && setStudentPage(p => p - 1);
  const handleStudentNext = () => studentPage < paginatedStudents.totalPages && setStudentPage(p => p + 1);

  /* ===============================
     STUDENT PROFILE VIEW
  ================================ */

  const exportStudentsToExcel = (drive, type, studentIds) => {
  const filteredStudents = students
    .filter(s => studentIds.includes(s.id))
    .map((s, index) => ({
      'S.No': index + 1,
      'Student Name': s.name,
      'Program': s.program,
      'Batch': s.batch,
      'Class': s.className,
      'Email': s.email,
      'Phone': s.phone,
      'Aggregate (%)': s.aggregate,
      'Company': drive.company,
      'Job Title': drive.jobTitle,
      'Category': type.toUpperCase(),
    }));

  const worksheet = XLSX.utils.json_to_sheet(filteredStudents);

  /* ===== Column Widths ===== */
  worksheet['!cols'] = [
    { wch: 6 },   // S.No
    { wch: 22 },  // Name
    { wch: 12 },  // Program
    { wch: 14 },  // Batch
    { wch: 12 },  // Class
    { wch: 28 },  // Email
    { wch: 16 },  // Phone
    { wch: 14 },  // Aggregate
    { wch: 18 },  // Company
    { wch: 22 },  // Job Title
    { wch: 14 },  // Category
  ];

  /* ===== Header Styling ===== */
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } }, // blue header
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    `${type}-Students`
  );

  XLSX.writeFile(
    workbook,
    `${drive.company}_${drive.jobTitle}_${type}_Students.xlsx`
  );
};

  if (view === VIEWS.PROFILE && selectedStudent) {
    return (
      <div className="p-6 space-y-6">
        <button
          onClick={() => setView(VIEWS.STUDENTS)}
          className="flex items-center gap-2 text-blue-600 text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
          <p className="text-gray-600 mt-1">
            {selectedStudent.program} • {selectedStudent.batch} •{' '}
            {selectedStudent.className}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-sm">
            <InfoItem icon={<Mail />} text={selectedStudent.email} />
            <InfoItem icon={<Phone />} text={selectedStudent.phone} />
            <InfoItem
              icon={<GraduationCap />}
              text={`Aggregate: ${selectedStudent.aggregate}%`}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ===============================
     STUDENT LIST VIEW
  ================================ */
  if (view === VIEWS.STUDENTS) {
    return (
      <div className="p-6">
        <button
          onClick={() => setView(VIEWS.LIST)}
          className="flex items-center gap-2 text-blue-600 text-sm hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Placement Drives
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold">
            Students – {selectedDrive.company} ({selectedDrive.jobTitle})
          </h2>

          {/* Excel Export Button */}
          <button
            onClick={() =>
              exportStudentsToExcel(
                selectedDrive,
                selectedCategory,
                selectedDrive[selectedCategory]
              )
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition shrink-0"
          >
            <Download className="w-4 h-4" />
            Export {selectedCategory} Students
          </button>
        </div>

        {/* Show count info */}
        <p className="text-sm text-gray-600 mb-4">
          Showing <span className="font-medium">{paginatedStudents.currentStudents.length}</span> of <span className="font-medium">{paginatedStudents.totalStudents}</span> students
        </p>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white border rounded-lg overflow-hidden">
            <div className="h-[500px] overflow-y-auto blue-scrollbar">
          <table className="w-full text-sm">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">Program</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">Batch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">Aggregate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedStudents.currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No students found in this category
                  </td>
                </tr>
              ) : (
                paginatedStudents.currentStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td
                    className="px-4 py-3 text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                    onClick={() => {
                      setSelectedStudent(student);
                      setView(VIEWS.PROFILE);
                    }}
                  >
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{student.program}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{student.batch}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{student.className}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{student.aggregate}%</td>
                </tr>
              )))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Desktop Pagination */}
        {paginatedStudents.totalStudents > 0 && paginatedStudents.totalPages > 1 && (
          <div className="hidden lg:flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600 bg-white rounded-b-lg">
            <button
              onClick={handleStudentPrev}
              disabled={studentPage === 1}
              className={`px-4 py-2 rounded-md ${
                studentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {studentPage} of {paginatedStudents.totalPages}
            </span>
            <button
              onClick={handleStudentNext}
              disabled={studentPage === paginatedStudents.totalPages}
              className={`px-4 py-2 rounded-md ${
                studentPage === paginatedStudents.totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {paginatedStudents.currentStudents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
              <p className="text-gray-500">No students found in this category</p>
            </div>
          ) : (
            paginatedStudents.currentStudents.map(student => (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  setView(VIEWS.PROFILE);
                }}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-blue-600 text-lg">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.program} • {student.batch}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {student.aggregate}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Class:</span> {student.className}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Pagination */}
        {paginatedStudents.totalStudents > 0 && paginatedStudents.totalPages > 1 && (
          <div className="lg:hidden flex justify-between items-center px-4 py-4 bg-white rounded-lg shadow-sm border border-gray-200 mt-4 text-sm text-gray-600">
            <button
              onClick={handleStudentPrev}
              disabled={studentPage === 1}
              className={`px-3 py-2 rounded-md text-sm ${
                studentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium text-xs">
              {studentPage}/{paginatedStudents.totalPages}
            </span>
            <button
              onClick={handleStudentNext}
              disabled={studentPage === paginatedStudents.totalPages}
              className={`px-3 py-2 rounded-md text-sm ${
                studentPage === paginatedStudents.totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ===============================
     PLACEMENT LIST VIEW
  ================================ */
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Student Placement Data
      </h2>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto blue-scrollbar">
          <table className="w-full">
            <thead className="bg-primary-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Placement ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Drive Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Min CTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Max CTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Max Fixed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Max Stipend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Eligible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">Shortlisted</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentEntries.map(drive => (
                <tr key={drive.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {drive.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {drive.company}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.jobTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.registrationStatus}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.driveSchedule}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.program}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.batch}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.className}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.minCTC}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.maxCTC}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{drive.maxFixed}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">₹{drive.stipend}</td>

                  {CATEGORIES.map(
                    key => (
                      <td
                        key={key}
                        className="px-6 py-4 text-sm text-blue-600 font-medium cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedDrive(drive);
                          setSelectedCategory(key);
                          setView(VIEWS.STUDENTS);
                        }}
                      >
                        <Users className="inline w-4 h-4 mr-1" />
                        {drive[key].length}
                      </td>
                    )
                  )}
                </tr>
              ))}
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
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
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
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 mt-6">
        {currentEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-200">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No placement data found</p>
            </div>
          </div>
        ) : (
          currentEntries.map((drive) => (
            <div
              key={drive.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{drive.company}</p>
                  <p className="text-sm text-gray-500">{drive.jobTitle}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  drive.registrationStatus === 'Open'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {drive.registrationStatus}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">ID:</span> {drive.id}</div>
                  <div><span className="font-medium">Drive:</span> {drive.driveSchedule}</div>
                  <div><span className="font-medium">Program:</span> {drive.program}</div>
                  <div><span className="font-medium">Batch:</span> {drive.batch}</div>
                  <div><span className="font-medium">Class:</span> {drive.className}</div>
                  <div><span className="font-medium">CTC:</span> {drive.minCTC} - {drive.maxCTC}</div>
                </div>
              </div>

              <div className="flex justify-between text-xs bg-gray-50 rounded-lg p-3">
                {CATEGORIES.map(key => (
                  <div
                    key={key}
                    className="text-center cursor-pointer hover:bg-gray-100 rounded p-1 transition"
                    onClick={() => {
                      setSelectedDrive(drive);
                      setSelectedCategory(key);
                      setView(VIEWS.STUDENTS);
                    }}
                  >
                    <div className="text-blue-600 font-bold text-lg">
                      {drive[key].length}
                    </div>
                    <div className="text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
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
            className={`px-4 py-2 rounded-md ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : ' bg-blue-600 hover:bg-blue-700 text-white'
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
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ===============================
   SMALL COMPONENT
================================ */
const InfoItem = ({ icon, text }) => (
  <div className="flex items-center gap-2 text-gray-700">
    <span className="w-4 h-4 text-gray-400">{icon}</span>
    {text}
  </div>
);

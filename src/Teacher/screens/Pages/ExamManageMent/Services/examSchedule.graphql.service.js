import { ApolloClient, InMemoryCache, createHttpLink, gql } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { authHeaderToPost, ExamMGMAPI } from "@/_services/api.js";

/* =========================================================
   Apollo Client (self-contained, no external import needed)
   ========================================================= */
const httpLink = createHttpLink({
  uri: `${ExamMGMAPI}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const extraHeaders = authHeaderToPost(); // { Authorization, Content-Type, view }
  return { headers: { ...headers, ...extraHeaders } };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

/* =========================================================
   GraphQL QUERIES
   ========================================================= */

/* 1️⃣ Get Exam Schedules by College ID */
const GET_EXAM_SCHEDULES_BY_COLLEGE_ID = gql`
  query GetExamSchedulesByCollegeId(
    $collegeId: ID!
    $page: Int!
    $size: Int!
    $sort: String!
    $direction: String!
  ) {
    examSchedulesByCollegeId(
      collegeId: $collegeId
      page: $page
      size: $size
      sort: $sort
      direction: $direction
    ) {
      page
      size
      totalElements
      totalPages
      first
      last
      numberOfElements
      content {
        examScheduleId
        examScheduleName
        academicYearId
        semesterId
        divisionId
        examTypeId
        examForTypeId
        description
        collegeId
        startDate
        endDate
       examToolTypeName
        courses {
          examScheduleCourseId
          subjectId
          examDate
          startExamDateTime
          endExamDateTime
          currentStudentStrength
           tool {
          toolId
          toolName
        }
          classrooms {
            examScheduleCourseClassroomId
            classroomId
            teacherId
            studentsCount
          }
        }
      }
    }
  }
`;

/* 2️⃣ Get Exam Schedules by Academic Year ID */
const GET_EXAM_SCHEDULES_BY_ACADEMIC_YEAR = gql`
  query GetExamSchedulesByAcademicYearId(
    $academicYearId: ID!
    $page: Int!
    $size: Int!
  ) {
    examSchedulesByAcademicYearId(
      academicYearId: $academicYearId
      page: $page
      size: $size
    ) {
      page
      size
      totalElements
      totalPages
      numberOfElements
      content {
        examScheduleId
        examScheduleName
        academicYearId
        semesterId
        divisionId
        examTypeId
        examForTypeId
        description
        collegeId
        startDate
        endDate
       examToolTypeName
        courses {
          examScheduleCourseId
          subjectId
          examDate
          startExamDateTime
          endExamDateTime
          currentStudentStrength
           tool {
          toolId
          toolName
        }
          classrooms {
            examScheduleCourseClassroomId
            classroomId
            teacherId
            studentsCount
          }
        }
      }
    }
  }
`;

/* 3️⃣ Get Single Exam Schedule by ID */
const GET_EXAM_SCHEDULE_BY_ID = gql`
  query GetExamScheduleById($id: ID!) {
    examSchedule(id: $id) {
      examScheduleId
      examScheduleName
      academicYearId
      
      academicYear{
        
        name
        batch{
          batchName
          batchId
        }
          program{
            programName
            programId
          }
      }
        semesterId
      semester{
        
        name
      }
        divisionId
      division{
        
        divisionName
      }
      examTypeId
      examForTypeId
      description
      collegeId
      startDate
      endDate
      examToolTypeName
      courses {
        examScheduleCourseId
        subjectId
        examDate
        startExamDateTime
        endExamDateTime
        currentStudentStrength
         tool {
        toolId
        toolName
      }
        classrooms {
          classroomId
          teacherId
          studentsCount
        }
      }
    }
  }
`;

/* =========================================================
   DATE UTIL
   ========================================================= */
export const parseExamDateTime = (value) => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return new Date(`${value}:00`);
  return new Date(value);
};

/* Helper to parse dates inside schedule */
const parseScheduleDates = (schedule) => ({
  ...schedule,
  startDate: parseExamDateTime(schedule.startDate),
  endDate: parseExamDateTime(schedule.endDate),
  courses: schedule.courses?.map((course) => ({
    ...course,
    startExamDateTime: parseExamDateTime(course.startExamDateTime),
    endExamDateTime: parseExamDateTime(course.endExamDateTime),
  })),
});

/* =========================================================
   SERVICE FUNCTIONS
   ========================================================= */

/* Fetch by College ID */
export const fetchExamSchedulesByCollegeId = async (
  collegeId,
  page = 0,
  size = 20,
  sort = "startDate",
  direction = "DESC"
) => {
  const { data } = await client.query({
    query: GET_EXAM_SCHEDULES_BY_COLLEGE_ID,
    variables: { collegeId, page, size, sort, direction },
    fetchPolicy: "network-only",
  });

  return {
    ...data.examSchedulesByCollegeId,
    content: data.examSchedulesByCollegeId.content.map(parseScheduleDates),
  };
};

/* Fetch by Academic Year */
export const fetchExamSchedulesByAcademicYearId = async (
  academicYearId,
  page = 0,
  size = 20
) => {
  const { data } = await client.query({
    query: GET_EXAM_SCHEDULES_BY_ACADEMIC_YEAR,
    variables: { academicYearId, page, size },
    fetchPolicy: "network-only",
  });

  return {
    ...data.examSchedulesByAcademicYearId,
    content: data.examSchedulesByAcademicYearId.content.map(parseScheduleDates),
  };
};

/* Fetch single exam schedule */
export const fetchExamScheduleById = async (examScheduleId) => {
  const { data } = await client.query({
    query: GET_EXAM_SCHEDULE_BY_ID,
    variables: { id: examScheduleId },
    fetchPolicy: "network-only",
  });

  return parseScheduleDates(data.examSchedule);
};



// /api/admin/exam-tools/search?examType=INTERNAL&toolTypeNameId=1&subjectId=74
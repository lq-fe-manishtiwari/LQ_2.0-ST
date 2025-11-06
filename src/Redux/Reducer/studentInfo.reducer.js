import { STUDENT_BATCH, STUDENT_INFO } from "@/Redux/constant";

export const StudentBatchReducer = (state = 0, action) => {
    switch (action.type) {
      case STUDENT_BATCH:
          return action.payload;
      default:
        return { ...state };
    }
};

export const StudentInfoReducer = (state = 0, action) => {
    switch (action.type) {
      case STUDENT_INFO:
          return action.payload;
      default:
        return { ...state };
    }
};
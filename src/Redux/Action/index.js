import { STUDENT_BATCH, STUDENT_INFO } from "@/Redux/constant";

export function StudentBatchAction(student_batch) {
    return {
      type: STUDENT_BATCH,
      payload: student_batch,
    };
}

export function StudentInfoAction(student_info) {
  return {
    type: STUDENT_INFO,
    payload: student_info,
  };
}
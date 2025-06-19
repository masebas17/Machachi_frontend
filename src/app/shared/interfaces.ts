export interface LevelResponse {
  correctProcess: boolean;
  error: null;
  message: string;
  data: [datalevel];
}

export interface datalevel {
  id?: number;
  name: string;
}

export interface shedule {
  correctProcess: boolean;
  error: null;
  message: string;
  data: [datashedule];
}
export interface datashedule {
  id: number;
  weekDay: string;
  startTime: number;
  endTime: number;
  level: datalevel;
}
export interface datasheduleYear {
  id: number;
  weekDay: string;
  startTime: number;
  endTime: number;
  level: datalevel;
}

export interface course {
  correctProcess: boolean;
  error: null;
  message: 'Cursos encontrados';
  data: [datacourses];
}

export interface datacourses {
  id: number;
  name: string;
  maxStudents: number;
  Schedule: [datashedule];
  Students: [dataStudent];
}

export interface Students {
  correctProcess: boolean;
  error: null;
  message: 'Matriculación exitosa';
  data: [dataStudent];
}

export interface dataStudent {
  id?: number;
  name?: string;
  lastName?: string;
  age?: number;
  identityNumber?: number;
  parentName?: string;
  address?: string;
  phone1?: number;
  email?: string;
  baptized?: null;
  disability?: null;
  courseId?: number;
  Course?: dataCourse;
  payment?: string;
  aproved?: null;
}

export interface dataCourse {
  id: number;
  name: string;
  maxStudents: number;
  ScheduleId: number;
  TeacherId: null;
  Schedule: datashedule;
}

export interface dataTeacher {
  id: number;
  name: string;
  lastName: string;
  phone: number;
  identityNumber: number;
  email: string;
  address: string;
  maritalStatus: string;
  username: string;
  password: string;
}

export interface editCourses_teacher {
  principalId: number;
  teachersId: number[];
}

export interface ediCourses_quota {
  name: string;
  maxStudents: number;
}

export interface reset_user {
  username: string;
  password: string;
}

export interface assistance {
  students: number[];
  date: string;
  courseId: number;
}

export interface update_assistance {
  students: number[];
  justifiedStudents: justifiedStudents[];
}

export interface justifiedStudents {
  id: number;
  observation: string;
}

export interface JustifyType {
  id: number;
  observation: string;
}

export interface EnrollmentApprovalPayload {
  approvedEnrollments: number[];
  observations: string;
}

export interface CertificateVerificationResponse {
  success: boolean;
  data?: CertificateData;
  message?: string;
}

export interface CertificateData {
  studentName: string;
  level: string;
  period: string;
  status: 'Aprobado' | 'Matriculado' | 'Reprobado';
}

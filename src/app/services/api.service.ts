import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import {
  datacourses,
  datalevel,
  datashedule,
  dataStudent,
  dataTeacher,
  editCourses_teacher,
  ediCourses_quota,
  LevelResponse,
  Students,
  reset_user,
  datasheduleYear,
  assistance,
  update_assistance,
  EnrollmentApprovalPayload,
  CertificateVerificationResponse,
} from '../shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  userUrl = 'https://sistema-matriculacion-backend.onrender.com';
  apiUrl = 'https://servicios.iglesiademachachi.com';
  //apiUrl = 'http://localhost:3000';

  getlevel(): Observable<datalevel[]> {
    return this.http.get<datalevel[]>(`${this.apiUrl}/api/levels`);
  }

  getShedule(): Observable<datashedule[]> {
    const currentDate: Date = new Date();
    return this.http.post<datashedule[]>(
      `${this.apiUrl}/api/schedules/enrollment/2025`,
      { currentDate },
    );
  }

  getShedulebyYear(): Observable<datasheduleYear[]> {
    return this.http.get<datasheduleYear[]>(
      `${this.apiUrl}/api/schedules/2025`,
    );
  }

  getCourses(id: any): Observable<datacourses[]> {
    return this.http.get<datacourses[]>(
      `${this.apiUrl}/api/courses/schedule/` + id,
    );
  }
  getcourse(): Observable<datacourses[]> {
    return this.http.get<datacourses[]>(`${this.apiUrl}/api/courses`);
  }

  getCoursebyId(id: number): Observable<{ data: datacourses }> {
    return this.http.get<{ data: datacourses }>(
      `${this.apiUrl}/api/courses/${id}`,
    );
  }

  getStudent(id: any): Observable<dataStudent[]> {
    return this.http.get<dataStudent[]>(`${this.apiUrl}/api/students/` + id);
  }

  async enrollemnt(Student: dataStudent) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/students`, Student)
      .toPromise();
    return resp;
  }

  async auto_enrollment(Student: any) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/students/auto-enroll`, Student)
      .toPromise();
    return resp;
  }

  async getCoursesbyid(id: any) {
    const response: any = await this.http
      .get(`${this.apiUrl}/api/courses/schedule/` + id)
      .toPromise();
    return response;
  }

  async getschedules_from_admin() {
    const response: any = await this.http
      .get(`${this.apiUrl}/api/schedules/2024`)
      .toPromise();
    return response;
  }

  async getschedules_all() {
    const response: any = await this.http
      .get(`${this.apiUrl}/api/schedules/all`)
      .toPromise();
    return response;
  }

  async getschedules_from_year(year: string) {
    const response: any = await this.http
      .get(`${this.apiUrl}/api/schedules/${year}`)
      .toPromise();
    return response;
  }

  async getcourses_from_admin(id: any) {
    const response: any = await this.http
      .get(`${this.apiUrl}/api/courses/schedule/` + id + '/count')
      .toPromise();
    return response;
  }

  async enrollemnt_admin(Student: dataStudent) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/students`, Student)
      .toPromise();
    return resp;
  }

  async enrollemnt_Teacher_admin(teacher: dataTeacher) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/teachers`, teacher)
      .toPromise();
    return resp;
  }

  async enrollemnt_Teacher(teacher: dataTeacher) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/teachers`, teacher)
      .toPromise();
    return resp;
  }

  async get_Teacher_admin(id: any) {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/teachers/filtered/${id}`)
      .toPromise();
    return resp;
  }
  async delete_student(id: any) {
    const resp: any = await this.http
      .delete(`${this.apiUrl}/api/students/${id}`)
      .toPromise();
    return resp;
  }

  async edit_student(id: any, Student: dataStudent | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/students/${id}`, Student)
      .toPromise();
    return resp;
  }

  async edit_student_enrollment(id: any, Student: dataStudent | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/students/enrollment/${id}`, Student)
      .toPromise();
    return resp;
  }

  async edit_course_teacher(id: any, course: editCourses_teacher | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/courses/${id}`, course)
      .toPromise();
    return resp;
  }

  async edit_course_quota(id: any, course: ediCourses_quota | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/courses/${id}`, course)
      .toPromise();
    return resp;
  }

  async get_Teacher_info() {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/teachers/info`)
      .toPromise();
    return resp;
  }

  async get_Teachers() {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/teachers`)
      .toPromise();
    return resp;
  }

  async edit_Teachers(id: any, teacher: dataTeacher | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/teachers/${id}`, teacher)
      .toPromise();
    return resp;
  }

  async delete_teacher(id: any) {
    const resp: any = await this.http
      .delete(`${this.apiUrl}/api/teachers/${id}`)
      .toPromise();
    return resp;
  }

  async get_courses_teacher(id: any) {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/courses/${id}`)
      .toPromise();
    return resp;
  }

  async verify_teacher(id: any) {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/users/${id}`)
      .toPromise();
    return resp;
  }

  async reset_data_user_teacher(id: any, user: reset_user | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/users/${id}`, user)
      .toPromise();
    return resp;
  }

  async Assistance(Assistance: assistance) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/assistance`, Assistance)
      .toPromise();
    return resp;
  }

  async get_Assistance(id: any, date: any) {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/assistance/courseId/${id}/date/${date}`)
      .toPromise();
    return resp;
  }

  async Update_Assistance(
    id: any,
    date: any,
    update_assistance: update_assistance,
  ) {
    const resp: any = await this.http
      .put(
        `${this.apiUrl}/api/assistance/courseId/${id}/date/${date}`,
        update_assistance,
      )
      .toPromise();
    return resp;
  }

  async delete_assistance(id: any, date: any) {
    const resp: any = await this.http
      .delete(
        `${this.apiUrl}/api/assistance/courseId/${id}/date/${date}`,
      )
      .toPromise();
    return resp;
  }

  async get_report_Assistance(id: any) {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/reports/assistance/courseId/${id}`)
      .toPromise();
    return resp;
  }

  async getEnrollmentsByCourse(courseId: any) {
    const resp: any = await this.http
      .get(`${this.apiUrl}/api/enrollments/course/${courseId}`)
      .toPromise();
    return resp;
  }

  updateEnrollmentsByCourse(
    courseId: number,
    payload: EnrollmentApprovalPayload,
  ): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/api/enrollments/course/${courseId}`,
      payload,
    );
  }

  verifyCertificate(hash: string): Promise<CertificateVerificationResponse> {
    return this.http
      .get<CertificateVerificationResponse>(
        `${this.apiUrl}/api/enrollments/verify/${hash}`,
      )
      .toPromise();
  }

  updateStudentEnrollmentStatus(id: number, payload: { status: string }) {
    return this.http.patch(
      `${this.apiUrl}/api/enrollments/${id}`,
      payload,
    );
  }

  updateStudentCourse(studentId: number, data: { courseId: number }) {
    return this.http
      .patch(`${this.apiUrl}/api/students/${studentId}/course`, data)
      .toPromise();
  }

  // get_Teacher_info(): Observable<any> {
  //   const options = {
  //     headers: new HttpHeaders({['x-token']: localStorage.getItem('jwt')})
  // };
  //   return this.http.get<any>(`${this.apiUrl}/api/teachers/info`, options)
  // }

  getInstitutions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/institutions`);
  }

  getActiveEnrollmentLevels(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/levels/active`);
  }

  getAvailableCourses(institutionId: number, levelOrder: number): Promise<any> {
    return this.http
      .get(
        `${this.apiUrl}/api/courses/available/${institutionId}/${levelOrder}`,
      )
      .toPromise();
  }

  // updateAndEnrollStudent(studentId: number, dataStudent: any): Promise<any> {
  //   const url = `${this.apiUrl}/enrollment-student/${studentId}`;
  //   return this.http.put(url, dataStudent).toPromise();
  // }

  async updateAndEnrollStudent(id: any, Student: dataStudent | any) {
    const resp: any = await this.http
      .put(`${this.apiUrl}/api/students/update-enrollment/${id}`, Student)
      .toPromise();
    return resp;
  }

  getCourseById(id: number): Promise<any> {
    return this.http.get<any>(`${this.apiUrl}/api/courses/${id}`).toPromise();
  }

  async enrollmentAdmin(Student: any) {
    const resp: any = await this.http
      .post(`${this.apiUrl}/api/students/admin-enroll`, Student)
      .toPromise();
    return resp;
  }

  async updateAndenrollmentAdmin(studentId: number, Student: any) {
    const resp: any = await this.http
      .put(
        `${this.apiUrl}/api/students/${studentId}/update-enrollment-admin`,
        Student,
      )
      .toPromise();
    return resp;
  }
}

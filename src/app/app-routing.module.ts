import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { SearcherComponent } from './searcher/searcher.component';
import { ScheduleSelectionComponent } from './schedule-selection/schedule-selection.component';
import { CourseSelectionComponent } from './course-selection/course-selection.component';
import { EnrollmentFormComponent } from './enrollment-form/enrollment-form.component';
import { LoginComponent } from './admin/login/login.component';
import { SidebarComponentComponent } from './admin/sidebar-component/sidebar-component.component';
import { StudentComponentComponent } from './admin/student-component/student-component.component';
import { TeacherComponentComponent } from './admin/teacher-component/teacher-component.component';
import { CourseComponentComponent } from './admin/course-component/course-component.component';
import { AdminComponent } from './admin/admin.component';
import { VoucherComponentComponent } from './voucher-component/voucher-component.component';
import { AuthGuard } from './guards/auth.guard';
import { CourseSelectionGuard } from './guards/course-selection.guard';
import { EnrollmentGuard } from './guards/enrollment.guard';
import { EditStudentComponent } from './admin/edit-student/edit-student.component';
import { PayComponent } from './admin/pay/pay.component';
import { EditCourseComponent } from './admin/edit-course/edit-course.component';
import { SupervisorComponent } from './supervisor/supervisor.component';
import { ListCoursesComponent } from './supervisor/list-courses/list-courses.component';
import { EditTeacherComponent } from './supervisor/edit-teacher/edit-teacher.component';
import { MyCoursesComponent } from './teacher-dashboard/my-courses/my-courses.component';
import { TeacherFormComponent } from './teacher-form/teacher-form.component';
import { TeacherFormGuard } from './guards/teacher-form.guard';
import { SupervisorGuard } from './guards/supervisor.guard';
import { TeacherDashboardComponent } from './teacher-dashboard/teacher-dashboard.component';
import { TeacherLoginComponent } from './teacher-login/teacher-login.component';
import { TeacherGuard } from './guards/teacher.guard';
import { ListMycoursesComponent } from './teacher-dashboard/list-mycourses/list-mycourses.component';
import { RecoverdataComponent } from './recoverdata/recoverdata.component';
import { RecoverUserComponent } from './recover-user/recover-user.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { RecoverDataGuard } from './guards/recover-data.guard';
import { AttendanceComponent } from './teacher-dashboard/attendance/attendance.component';
import { GradesComponent } from './teacher-dashboard/grades/grades.component';
import { LevelFormSelectionComponent } from './level-form-selection/level-form-selection.component';
import { ClassroomSelectionComponent } from './classroom-selection/classroom-selection.component';
import { VerifyInformationComponent } from './verify-information/verify-information.component';
import { RegistrationFormComponent } from './registration-form/registration-form.component';
import { EnrollmentAdminComponent } from './admin/enrollment-admin/enrollment-admin.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { EditAttendanceComponent } from './teacher-dashboard/edit-attendance/edit-attendance.component';
import { TeacherManagementComponent } from './admin/teacher-management/teacher-management.component';
import { ReportAttendanceComponent } from './teacher-dashboard/report-attendance/report-attendance.component';
import { AttendanceReportsComponentComponent } from './admin/attendance-reports-component/attendance-reports-component.component';
import { VerifyInformationStudentsComponent } from './StudentsComponents/verify-information-students/verify-information-students.component';
import { EnrollmentListComponent } from './teacher-dashboard/enrollment-list/enrollment-list.component';
import { EnrollmentReportComponent } from './admin/enrollment-report/enrollment-report.component';
import { VerifyCertificateComponent } from './verify-certificate/verify-certificate.component';
import { SchoolFormSelectionComponent } from './school-form-selection/school-form-selection.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: MainMenuComponent },
  { path: 'searcher', component: SearcherComponent },
  {
    path: 'student/:identityNumber',
    component: VerifyInformationStudentsComponent,
  },
  { path: 'shedule_selection', component: ScheduleSelectionComponent },
  {
    path: 'course_selection/:id',
    canActivate: [CourseSelectionGuard],
    component: CourseSelectionComponent,
  },
  {
    path: 'enrollment/:id',
    canActivate: [EnrollmentGuard],
    component: EnrollmentFormComponent,
  },
  { path: 'level-form-selection', component: LevelFormSelectionComponent },
  {
    path: 'school-form-selection',
    component: SchoolFormSelectionComponent,
  },
  {
    path: 'classroom_selection/:id/:identityNumber',
    canActivate: [CourseSelectionGuard],
    component: ClassroomSelectionComponent,
  },
  {
    path: 'verify_information/:id/:levelOrder/:identityNumber',
    canActivate: [EnrollmentGuard],
    component: VerifyInformationComponent,
  },
  { path: 'verify-certificate/:hash', component: VerifyCertificateComponent },
  { path: 'registration-form', component: RegistrationFormComponent },
  { path: 'voucher', component: VoucherComponentComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sidebar', component: SidebarComponentComponent },
  {
    path: 'teacher-form',
    canActivate: [TeacherFormGuard],
    component: TeacherFormComponent,
  },
  { path: 'teacher-login', component: TeacherLoginComponent },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    component: AdminComponent,
    children: [
      { path: 'student', component: StudentComponentComponent },
      { path: 'teacher', component: TeacherComponentComponent },
      { path: 'course', component: CourseComponentComponent },
      { path: 'edit-student', component: EditStudentComponent },
      { path: 'pay', component: PayComponent },
      { path: 'edit-course', component: EditCourseComponent },
      { path: 'enrollment_admin', component: EnrollmentAdminComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'teacher-management', component: TeacherManagementComponent },
      {
        path: 'attendance-reports',
        component: AttendanceReportsComponentComponent,
      },
      { path: 'enrollment-report', component: EnrollmentReportComponent },
    ],
  },
  {
    path: 'supervisor',
    canActivate: [SupervisorGuard],
    component: SupervisorComponent,
    children: [
      { path: 'list-courses', component: ListCoursesComponent },
      { path: 'edit-teacher', component: EditTeacherComponent },
      { path: 'mycourses', component: MyCoursesComponent },
      { path: 'edit-student', component: EditStudentComponent },
      { path: 'edit-course', component: EditCourseComponent },
      { path: 'teacher-management', component: TeacherManagementComponent },
      {
        path: 'attendance-reports',
        component: AttendanceReportsComponentComponent,
      },
    ],
  },
  {
    path: 'teacher',
    canActivate: [TeacherGuard],
    component: TeacherDashboardComponent,
    children: [
      { path: 'mycourses', component: MyCoursesComponent },
      { path: 'listcourses/:id', component: ListMycoursesComponent },
      { path: 'attendance/:id', component: AttendanceComponent },
      { path: 'edit-attendance/:id/:date', component: EditAttendanceComponent },
      { path: 'grades', component: GradesComponent },
      { path: 'report-attendance', component: ReportAttendanceComponent },
      { path: 'enrollment-aprove/:id', component: EnrollmentListComponent },
    ],
  },
  { path: 'recover-data/:type', component: RecoverdataComponent },
  {
    path: 'recover_user/:id',
    canActivate: [RecoverDataGuard],
    component: RecoverUserComponent,
  },
  {
    path: 'recover_password/:id',
    canActivate: [RecoverDataGuard],
    component: RecoverPasswordComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { NamespaceBody } from 'typescript';
import { faListCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
})
export class MyCoursesComponent implements OnInit {
  mycourses: any;
  name_teacher: any;
  principal_teacher: any;
  faListCheck = faListCheck;

  constructor(private ApiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.misCursos();
  }

  async misCursos() {
    const resp = await this.ApiService.get_Teacher_info();
    console.log(resp);

    this.mycourses = resp.data.Teacher.Courses;
    this.name_teacher = resp.data.Teacher;
    this.principal_teacher = resp.data.Teacher.Courses.principalId;
  }

  list_of_course(event: any) {
    console.log(event.target.name);
    localStorage.setItem('en', event.target.name);
    this.router.navigate(['/teacher/listcourses', event.target.name]);
  }

  attendance(event: any) {
    console.log(event.target.name);
    localStorage.setItem('en', event.target.name);
    this.router.navigate(['/teacher/attendance', event.target.name]);
  }

  final_report(event: any) {
    console.log(event.target.name);
    localStorage.setItem('en', event.target.name);
    this.router.navigate(['/teacher/enrollment-aprove', event.target.name]);
  }

  // mostrar_listado(){
  //   const filtercourse = this.courses.filter(
  //     (course) => this.verSeleccion_curso === course.id
  //   );

  //   const filtershedule = this.Schedule_data.filter(
  //     (Schedule) => this.verSeleccion === Schedule.Level.id
  //   );

  //   this.students = filtercourse[0].Students

  //     if(this.students){
  //       const Toast = Swal.mixin({
  //         toast: true,
  //         position: 'top-end',
  //         showConfirmButton: false,
  //         timer: 1000,
  //         timerProgressBar: true,
  //       })
  //        Toast.fire({
  //         icon: 'success',
  //         title: 'Generando listado'
  //       }).then(() =>{

  //     })
  //     }
  // }
}

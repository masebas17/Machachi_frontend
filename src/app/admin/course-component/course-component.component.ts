import { NgForOf } from '@angular/common';
import { ResourceLoader } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loadavg } from 'os';
import { ApiService } from 'src/app/services/api.service';
import { dataStudent } from 'src/app/shared/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-component',
  templateUrl: './course-component.component.html',
  styleUrls: ['./course-component.component.css']
})
export class CourseComponentComponent implements OnInit {
  opcionSeleccionada: number = 0;
  verSeleccion: number = 0;
  seleccion_curso: number = 0;
  verSeleccion_curso: number = 0;
  shedules: any;
  courses: any;
  students: Array<dataStudent>;
  courseId: any;

  constructor(
    private _apiService: ApiService,
    private router: Router
  ) { 
    this.shedules = {};
    this.courses = [];
    
  }
  ngOnInit(): void {
    this.getShedule()
  }


  capturar(){
    this.verSeleccion = this.opcionSeleccionada
    console.log(this.verSeleccion)
    this.getcourses()
  }

  capturar_curso(){
    this.verSeleccion_curso = this.seleccion_curso
    console.log(this.verSeleccion_curso)
  }

  async getShedule(){
    const resp = await this._apiService.getschedules_from_admin()
    console.log(resp)
    this.shedules = resp
  }

  async getcourses(){
    const resp = await this._apiService.getCoursesbyid(this.verSeleccion)
    this.courses = resp.data
    console.log(this.courses)
    this.seleccion_curso = 0;
  }

  listado(){
    const filtercourse = this.courses.filter(
      (course) => this.verSeleccion_curso === course.id
    );

    this.students = filtercourse[0].Students

      if(this.students){
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        })
         Toast.fire({
          icon: 'success',
          title: 'Generando listado'
        }).then(() =>{

        
      })
      }
  }
}


import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import {
  faEdit,
  faTrash,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ediCourses_quota,
  editCourses_teacher,
} from 'src/app/shared/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css'],
})
export class EditCourseComponent implements OnInit {
  opcionSeleccionada: number = 0;
  verSeleccion: number = 0;
  seleccion_curso: number = 0;
  verSeleccion_curso: number = 0;
  opcion: number = 0;
  opcion_teacher: number = 0;
  opcion2: number = 0;
  opcion_teacher2: number = 0;
  opcion3: number = 0;
  opcion_teacher3: number = 0;
  shedules: any;

  Schedule_data: any;
  data_courses: any;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  faMinus = faMinus;
  list_teachers: any;
  data_courses_teacher: editCourses_teacher;
  data_courses_quota: ediCourses_quota;
  principalTeacher;
  Teachers;

  opcion_periodo: string = '';
  opcionHorario: number = 0;
  schedules: any[] = [];
  courses: any;

  cupo: number;
  courseId: any;
  id_course: any;
  display = 'none';

  mostrarBotonPlus: boolean = true;
  mostrarBotonMinus: boolean = false;

  constructor(private _apiService: ApiService, private router: Router) {
    this.shedules = {};
    this.courses = [];
    this.Teachers = [];
  }

  ngOnInit(): void {
    this.getShedule();
  }
  FormCourse = new FormGroup({
    maxStudents: new FormControl('30', [
      Validators.min(30),
      Validators.max(50),
      Validators.maxLength(2),
    ]),
    Teacher: new FormControl(''),
    Teacher2: new FormControl(''),
    Teacher3: new FormControl(''),
  });

  async capturarPeriodo() {
    const resp = await this._apiService.getschedules_from_year(
      this.opcion_periodo
    );
    this.schedules = resp.data;
    this.opcionHorario = 0;
    this.courses = [];
  }

  async capturarHorario() {
    if (this.opcionHorario) {
      const resp = await this._apiService.getCoursesbyid(this.opcionHorario);
      this.courses = resp.data;
    }
  }

  capturar() {
    this.verSeleccion = this.opcionSeleccionada;
    console.log(this.verSeleccion);
  }

  capturar_curso() {
    this.verSeleccion_curso = this.seleccion_curso;
    console.log(this.verSeleccion_curso);
  }

  capturar_teacher() {
    this.opcion_teacher = this.opcion;
    console.log(this.opcion_teacher);
  }

  capturar_teacher2() {
    this.opcion_teacher2 = this.opcion2;
    console.log(this.opcion_teacher2);
  }
  capturar_teacher3() {
    this.opcion_teacher3 = this.opcion3;
    console.log(this.opcion_teacher3);
  }

  async getShedule() {
    const resp = await this._apiService.getschedules_from_admin();
    console.log(resp);
    this.shedules = resp;
    this.Schedule_data = resp.data;
  }

  async getcourses() {
    const resp = await this._apiService.getCoursesbyid(this.verSeleccion);
    this.courses = resp.data;
    this.data_courses = resp;
    console.log(this.data_courses);
    this.seleccion_curso = 0;
  }

  async getTeachers() {
    const resp = await this._apiService.get_Teacher_admin(this.verSeleccion);
    this.list_teachers = resp.data;
    this.opcion = 0;
  }

  async edit(event: any) {
    this.courseId = parseInt(event.target.name);

    const findCourseId = this.courses.find(
      (course) => course.id === this.courseId
    );

    this.id_course = findCourseId.id;
    console.log(this.id_course);

    this.getTeachers();
  }

  async edit_teachers() {
    if (this.opcion_teacher) {
      this.data_courses_teacher = {
        principalId: this.opcion_teacher,
        teachersId: [
          this.opcion_teacher,
          this.opcion_teacher2,
          this.opcion_teacher3,
        ],
      };

      const resp = await this._apiService.edit_course_teacher(
        this.id_course,
        this.data_courses_teacher
      );
      console.log(resp);

      this.capturarHorario();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No esta escogiendo ningun catequista',
        text: 'Debe seleccionar al menos el Catequista Principal si quiere realizar la acción de asignación',
      });
    }
  }

  async edit_quota() {
    this.data_courses_quota = {
      name: this.courses.name,
      maxStudents: this.FormCourse.get('maxStudents').value,
    };

    const resp = await this._apiService.edit_course_quota(
      this.id_course,
      this.data_courses_quota
    );
    console.log(resp);

    this.capturarHorario();
  }

  async Quitar_Catequista() {
    this.data_courses_teacher = {
      principalId: null,
      teachersId: [],
    };
    const resp = await this._apiService.edit_course_teacher(
      this.id_course,
      this.data_courses_teacher
    );
    console.log(resp);

    this.capturarHorario();
    this.opcion = 0;
    this.opcion2 = 0;
    this.opcion3 = 0;
    this.opcion_teacher = 0;
    this.opcion_teacher2 = 0;
    this.opcion_teacher3 = 0;
  }

  openselect() {
    this.mostrarBotonPlus = false;
    this.mostrarBotonMinus = true;
    this.display = 'block';
  }

  closeselect() {
    this.mostrarBotonPlus = true;
    this.mostrarBotonMinus = false;
    this.display = 'none';
    this.opcion_teacher3 = 0;
  }
}

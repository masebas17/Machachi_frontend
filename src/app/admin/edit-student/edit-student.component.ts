import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { dataStudent } from 'src/app/shared/interfaces';
import Swal from 'sweetalert2';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ToastrService } from 'ngx-toastr';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.css'],
})
export class EditStudentComponent implements OnInit {
  opcionSeleccionada: number = 0;
  seleccion_curso: number = 0;
  verSeleccion: number = 0;
  verSeleccion_curso: number = 0;
  shedules: any;
  courses: any;
  student: dataStudent = {};
  datos_of_students: dataStudent = {};
  student_for_voucher: any;
  StudentId: number;
  today: Date = new Date();
  pipe = new DatePipe('en-US');
  fecha = null;
  Course_id: number = 0;
  data_student: any;
  scheduleName: string = '';
  dataEnrollment: any;
  data_courses: any;
  periodOption: string = '';
  Schedule_data: any;
  institutionId: number = 0;
  levelOrder: number = 0;

  constructor(
    private _apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.shedules = {};
    this.courses = [];
  }

  FormCI = new FormGroup({
    CI: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
  });

  Formstudent = new FormGroup({
    identityNumber: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
    lastName: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    age: new FormControl('', Validators.required),
    parentName: new FormControl('', Validators.required),
    phone1: new FormControl(
      '',
      Validators.compose([Validators.required, Validators.maxLength(10)])
    ),
    email: new FormControl('', Validators.email),
    address: new FormControl('', Validators.required),
    baptized: new FormControl('', Validators.required),
    disability: new FormControl('', Validators.required),
    aproved: new FormControl('', Validators.required),
  });
  ngOnInit(): void {}

  consultar() {
    this._apiService
      .getStudent(this.FormCI.get('CI').value)
      .subscribe((resp: any) => {
        this.student = resp.data.student;

        if (this.student) {
          const myTimeout = setTimeout(() => {
            Swal.fire({
              icon: 'success',
              title: 'Se ha encontrado un estudiante',
              confirmButtonColor: '#1D71B8',
            }).then((result) => {
              if (result.isConfirmed) {
                this.data_student = resp.data.student;
                this.dataEnrollment = resp.data.latestEnrollment;
                this.dataEnrollment.newStatus = this.dataEnrollment.status;
                this.institutionId = this.data_student.Course?.Institution?.id;
                this.scheduleName = `${this.dataEnrollment?.Course.Schedule.weekDay} ${this.dataEnrollment?.Course.Schedule.startTime} a ${this.dataEnrollment?.Course.Schedule.endTime}`;
                console.log('data enrollment', this.dataEnrollment);
                console.log('data student', this.data_student);
                this.editar();
                this.getShedule();
              }
            });
          }, 1000);
          myTimeout;
        } else {
          this.router.navigate(['/admin']);
        }
      });
  }

  async capturar_periodo() {
    const resp = await this._apiService.getschedules_from_year(
      this.periodOption
    );
    console.log(resp);
    this.shedules = resp;
    this.Schedule_data = resp.data;
    this.opcionSeleccionada = 0;
    this.verSeleccion_curso = 0;
  }

  capturar() {
    this.verSeleccion = this.opcionSeleccionada;
    console.log(this.verSeleccion);
    this.getcourses();
    this.verSeleccion_curso = 0;
  }

  async capturar_curso() {
    this.verSeleccion_curso = this.seleccion_curso;
    console.log(this.verSeleccion_curso);
    const resp = await this._apiService.getCourseById(this.verSeleccion_curso);
    this.levelOrder = resp.data.Level.order;
    this.institutionId = resp.data.institutionId;
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

  groupByPeriod(shedules: any[]) {
    if (!shedules || shedules.length === 0) {
      return [];
    }

    const grouped = shedules.reduce((acc, shedule) => {
      const period = shedule.period;
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(shedule);
      return acc;
    }, {});

    return Object.keys(grouped).map((key) => ({
      period: key,
      shedules: grouped[key],
    }));
  }

  async edit_course() {
    this.Course_id = this.verSeleccion_curso;
    console.log(this.Course_id);
    if (this.Course_id != 0) {
      await Swal.fire({
        icon: 'success',
        title: 'Cambio de Curso',
        text: 'Guardando los datos del nuevo curso, debe guardar cambios totales',
        timer: 4000,
        confirmButtonColor: '#1D71B8',
        showConfirmButton: false,
      });
    }
  }

  capturar_level_curso() {
    document.getElementById('Text_Institution').innerHTML =
      this.dataEnrollment?.Course?.Institution?.name;
    document.getElementById('Text_level').innerHTML =
      this.dataEnrollment?.Course?.Level?.name;
    document.getElementById('Text_curso').innerHTML =
      this.dataEnrollment?.Course?.name;
  }

  editar() {
    this.Formstudent.setValue({
      identityNumber: this.student.identityNumber,
      lastName: this.student.lastName,
      name: this.student.name,
      age: this.student.age,
      parentName: this.student.parentName,
      phone1: this.student.phone1,
      email: this.student.email,
      address: this.student.address,
      baptized: this.student.baptized,
      disability: this.student.disability,
      aproved: this.student.aproved,
    });
  }

  // delete() {
  //   Swal.fire({
  //     title: 'Eliminar Registro',
  //     text: '¿Está seguro que desea eliminar a este estudiante? ',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     cancelButtonText: 'Cancelar',
  //     confirmButtonColor: '#28a745',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Si, eliminar',
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       await this._apiService.delete_student(this.student.id);
  //       await Swal.fire({
  //         title: 'Eliminado',
  //         text: 'Se ha eliminado un registro de estudiante',
  //         icon: 'success',
  //         timer: 3000,
  //         showConfirmButton: false,
  //       });
  //       // window.location.reload();
  //     }
  //   });
  // }

  async edit_student(values: any) {
    this.datos_of_students = values;

    if (this.Course_id != 0) {
      this.datos_of_students.courseId = this.Course_id;
    }
    console.log(this.datos_of_students.courseId);

    console.log(this.datos_of_students);
    const resp = await this._apiService.edit_student(
      this.student.id,
      this.datos_of_students
    );

    if (resp) {
      await Swal.fire({
        icon: 'success',
        title: 'Se realizaron los cambios en el registro',
        confirmButtonColor: '#1D71B8',
        timer: 3000,
        showConfirmButton: false,
      });
      window.location.reload();
    }

    // if(resp){
    //   Swal.fire({
    //     title: '¡Cambios Guardados!',
    //     text: "¿Desea generar el Acta de Compromiso?",
    //     icon: 'warning',
    //     showCancelButton: true,
    //     confirmButtonColor: '#3085d6',
    //     cancelButtonColor: '#d33',
    //     confirmButtonText: 'Generar nueva Acta',
    //     cancelButtonText: 'Cancelar'
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this._apiService.getStudent(this.FormCI.get("CI").value).subscribe((resp_student: any) =>{
    //         console.log(resp_student.data)
    //         this.student_for_voucher = resp_student.data
    //         this.createPDF()
    //         window.location.reload();
    //     })}else if (result.isDismissed){
    //       window.location.reload();
    //     }
    //   }
    //   )
    // }
  }

  updateEnrollmentStatus(enrollment: any): void {
    if (!enrollment.newStatus || enrollment.newStatus === enrollment.status)
      return;

    const payload = { status: enrollment.newStatus };

    this._apiService
      .updateStudentEnrollmentStatus(enrollment.id, payload)
      .subscribe({
        next: () => {
          enrollment.status = enrollment.newStatus;
          enrollment.newStatus = null;
          this.toastr.success(
            `Se ha actualizado al alumno ${
              this.data_student.name + ' ' + this.data_student.lastName
            }, su estatus de matrícula`
          );
        },
        error: (err) => {
          console.error('Error al actualizar el estado', err);
          this.toastr.error(
            `Hubo un error al cambiar el status del alumno ${
              this.data_student.name + ' ' + this.data_student.lastName
            }`
          );
        },
      });
  }

  async change_course() {
    const selectedCourseId = this.verSeleccion_curso;
    const studentId = this.data_student.id;

    if (!selectedCourseId || selectedCourseId === 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Curso no seleccionado',
        text: 'Por favor, selecciona un curso antes de continuar.',
        confirmButtonColor: '#1D71B8',
      });
      return;
    }
    try {
      const response = await this._apiService.updateStudentCourse(studentId, {
        courseId: selectedCourseId,
      });

      if (!response) {
        throw new Error('Respuesta no válida del servidor.');
      }

      await Swal.fire({
        icon: 'success',
        title: 'Curso actualizado con éxito',
        text: 'El cambio de curso se realizó con éxito.',
        confirmButtonColor: '#1D71B8',
      });

      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar el curso:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#1D71B8',
      });
    }
  }
}

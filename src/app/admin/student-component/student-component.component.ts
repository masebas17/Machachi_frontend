import { ResourceLoader } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { dataStudent } from 'src/app/shared/interfaces';
import Swal from 'sweetalert2';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-student-component',
  templateUrl: './student-component.component.html',
  styleUrls: ['./student-component.component.css'],
})
export class StudentComponentComponent implements OnInit {
  opcionSeleccionada: number = 0;
  opcion_periodo: string = '';
  Schedule_data: any;
  data_courses: any;
  seleccion_curso: number = 0;
  verSeleccion: number = 0;
  verSeleccion_curso: number = 0;
  shedules: any;
  courses: any;
  student: dataStudent = {};
  courseId: number = 0;
  datos_of_students: any;
  formattedDate: string;
  pipe = new DatePipe('en-US');
  fecha = null;
  qrCode: any;
  institutionId: number = 0;
  levelOrder: number = 0;

  constructor(
    private _apiService: ApiService,
    private router: Router,
    private pdfGeneratorService: PdfGeneratorService
  ) {
    this.shedules = {};
    this.courses = [];
  }

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
  });

  ngOnInit(): void {}

  async capturar_periodo() {
    console.log(this.opcion_periodo);
    const resp = await this._apiService.getschedules_from_year(
      this.opcion_periodo
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

  async enroll_student(values: any) {
    this.student = values;
    this.student.courseId = this.verSeleccion_curso;

    const payload = {
      ...this.student,
      institutionId: this.institutionId,
      levelOrder: this.levelOrder,
    };

    console.log('payload antes de enviar nuevo alumno', payload);

    const resp = await this._apiService.enrollmentAdmin(payload);

    if (resp === undefined) {
      return;
    }

    console.log(resp);
    this.datos_of_students = resp.data.enrolledStudent;
    this.qrCode = resp.data.qrCode;
    console.log(this.datos_of_students);

    if (resp) {
      const myTimeout = setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Matrícula Exitosa',
          text: 'se han registrado los datos con éxito',
          confirmButtonText: 'Generar Acta de Compromiso',
          confirmButtonColor: '#1D71B8',
        }).then((result) => {
          if (result.isConfirmed) {
            this.formattedDate = this.formatUpdatedAt(
              this.datos_of_students.updatedAt
            );
            this.createPDF(false);
            // window.location.reload();
            this.router.navigate(['/admin']);
          }
        });
      }, 1000);
      myTimeout;
    } else {
      this.router.navigate(['/admin']);
    }
  }

  formatUpdatedAt(dateStr: string): string {
    if (dateStr) {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/Guayaquil',
      };
      const formatter = new Intl.DateTimeFormat('es-ES', options);
      return formatter.format(date);
    }
    return '';
  }

  createPDF(isCopy: boolean) {
    this.pdfGeneratorService
      .generatePDF(
        this.datos_of_students,
        this.pipe,
        this.formattedDate,
        isCopy ? 'copia' : 'original',
        this.qrCode
      )
      .subscribe((voucher) => {
        const pdf = pdfMake.createPdf(voucher);
        pdf.open();
      });
  }
}

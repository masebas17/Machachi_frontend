import { NgForOf, UpperCasePipe } from '@angular/common';
import { ResourceLoader } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { loadavg } from 'os';
import { ApiService } from 'src/app/services/api.service';
import { dataStudent } from 'src/app/shared/interfaces';
import Swal from 'sweetalert2';
import printJS from 'print-js';
import {
  faPrint,
  faMoneyCheckDollar,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { AsignatedPipe } from 'src/app/shared/asignated.pipe';
import { SiNoPipe } from 'src/app/shared/si-no.pipe';
import { BaptizedPipe } from 'src/app/shared/baptized.pipe';
import { find, single } from 'rxjs';
import { TeacherComponentComponent } from '../teacher-component/teacher-component.component';
import { PdfMakeWrapper, Txt, Table, Columns, Stack } from 'pdfmake-wrapper';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-course-component',
  templateUrl: './course-component.component.html',
  styleUrls: ['./course-component.component.css'],
  providers: [BaptizedPipe, SiNoPipe],
})
export class CourseComponentComponent implements OnInit {
  opcionSeleccionada: number = 0;
  opcionSeleccionada_edit: number = 0;
  opcion_periodo: string;
  opcion_periodo_edit: string = '';
  verSeleccion: number = 0;
  verSeleccion_edit: number = 0;
  seleccion_curso: number = 0;
  seleccion_curso_edit: number = 0;
  verSeleccion_curso: number = 0;
  verSeleccion_curso_edit: number = 0;
  shedules: any;
  courses: any;
  students: Array<dataStudent>;
  courseId: any;
  courseId_edit: any;
  Schedule_data: any;
  faprint = faPrint;
  faMoneyCheckDollar = faMoneyCheckDollar;
  faDownload = faDownload;
  studentId: any;
  data_courses: any;
  data_student: dataStudent = {};
  classroom;
  level;
  teachers;
  data1: any;
  period: string;
  period_parcial_name: string;

  constructor(
    private _apiService: ApiService,
    private router: Router,
    private baptized: BaptizedPipe,
    private SiNo: SiNoPipe
  ) {
    this.shedules = {};
    this.courses = [];
  }

  Formpay = new FormGroup({
    pay: new FormControl('', Validators.required),
  });

  ngOnInit(): void {}

  capturar() {
    this.verSeleccion = this.opcionSeleccionada;
    console.log(this.verSeleccion);
    this.getcourses();
    this.verSeleccion_curso = 0;
  }

  capturar_curso() {
    this.verSeleccion_curso = this.seleccion_curso;
    console.log(this.verSeleccion_curso);
  }

  capturar_edit() {
    this.verSeleccion_edit = this.opcionSeleccionada_edit;
    console.log(this.verSeleccion_edit);
    this.getcourses_edit();
    this.verSeleccion_curso = 0;
  }

  capturar_curso_edit() {
    this.verSeleccion_curso_edit = this.seleccion_curso_edit;
    console.log(this.verSeleccion_curso_edit);
  }

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

  async capturar_periodo_edit() {
    console.log(this.opcion_periodo_edit);
    const resp = await this._apiService.getschedules_from_year(
      this.opcion_periodo_edit
    );
    console.log(resp);
    this.shedules = resp;
    this.Schedule_data = resp.data;
    this.opcionSeleccionada_edit = 0;
    this.seleccion_curso_edit = 0;
  }

  async getShedule() {
    const resp = await this._apiService.getschedules_from_admin();
    console.log(resp);
    this.shedules = resp;
    this.Schedule_data = resp.data;
  }

  async getShedule_edit(event: any) {
    const resp = await this._apiService.getschedules_from_admin();
    console.log(resp);
    this.shedules = resp;
    this.Schedule_data = resp.data;
    this.opcionSeleccionada_edit = 0;
    this.verSeleccion_curso_edit = 0;

    console.log(event.target.name);
    this.studentId = parseInt(event.target.name);

    const findStudents = this.students.find(
      (Student) => Student.id === this.studentId
    );

    console.log(findStudents);
    this.data_student = findStudents;
  }

  async getcourses() {
    const resp = await this._apiService.getCoursesbyid(this.verSeleccion);
    this.courses = resp.data;
    this.data_courses = resp;
    console.log(this.data_courses);
    this.seleccion_curso = 0;
  }

  async getcourses_edit() {
    const resp = await this._apiService.getCoursesbyid(this.verSeleccion_edit);
    this.courses = resp.data;
    console.log('Cursos', this.courses);
    this.seleccion_curso_edit = 0;
  }

  reset_courses() {
    this.opcionSeleccionada_edit = 0;
    this.seleccion_curso_edit = 0;
  }

  listado() {
    const filtercourse = this.courses.filter(
      (course) => this.verSeleccion_curso === course.id
    );

    const filtershedule = this.Schedule_data.filter(
      (Schedule) => this.verSeleccion === Schedule.id
    );

    console.log('filtershedule', filtershedule);

    this.classroom = filtercourse[0];
    this.level = filtercourse[0];
    this.period_parcial_name = filtershedule[0].period;
    const currentYear = parseInt(this.period_parcial_name);
    const nextYear = currentYear + 1;
    this.period = `${this.period_parcial_name} - ${nextYear}`;
    this.students = filtercourse[0].Students;
    this.teachers = filtercourse[0].Teachers;

    if (this.students) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: 'Generando listado',
      }).then(() => {
        document.getElementById('Text_Schedule').innerHTML =
          filtershedule[0].weekDay +
          ' ' +
          '( ' +
          filtershedule[0].startTime +
          ' - ' +
          filtershedule[0].endTime +
          ' )';
        document.getElementById('Text_level').innerHTML =
          filtercourse[0].Level.name;
        document.getElementById('Text_course').innerHTML = filtercourse[0].name;
        //  if(this.teachers != null){
        //   document.getElementById('Text_Teacher').innerHTML = (this.teachers.lastName + ' ' + this.teachers.name).toUpperCase()
        // }
        // else{
        //    document.getElementById('Text_Teacher').innerHTML = 'No asignado'
        //  }
      });
    }
  }

  print2() {
    printJS({
      printable: this.students,
      type: 'json',
      properties: [
        { field: 'identityNumber', displayName: 'Cédula' },
        {
          field: 'lastName',
          displayName: 'Apellidos',
          targetStyles: [UpperCasePipe],
        },
        { field: 'name', displayName: 'Nombres' },
        { field: 'age', displayName: 'Edad' },
        { field: 'null', displayName: 'Observaciones' },
      ],
      header:
        '<h2 class="custom">Parroquia Eclesiástica Santiago Apóstol de Machachi <br>Catequesis 2022-2023</h2><hr><br>',
      // style: '.custom-h3 { color: red; }'
      style: '.custom { color: black;}',
      font_size: '9pt',
      honorMarginPadding: true,
    });
  }

  print() {
    if (this.students) {
      printJS({
        printable: 'lista_del_curso',
        type: 'html',
        documentTitle:
          'Sistema de Gestión de Catequesis - Generación de listas',
        targetStyles: ['*'],
        header:
          '<h2 class="custom">Parroquia Eclesiástica Santiago Apóstol de Machachi <br>Catequesis 2022-2023</h2><hr><br>',
        style: '.custom { color: black;}',
        font_size: '9pt',
        honorMarginPadding: true,
        font: 'Arial',
        ignoreElements: [
          'table-responsive',
          'num_cedula',
          'btn-edit-voucher',
          'btn-creater-voucher',
          'actions',
        ],
      });
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }

  edit(event: any) {
    console.log(event.target.name);
    this.studentId = parseInt(event.target.name);

    const findStudents = this.students.find(
      (Student) => Student.id === this.studentId
    );

    console.log(findStudents);
    this.data_student = findStudents;

    if (this.data_student.payment) {
      this.Formpay.setValue({
        pay: this.data_student.payment,
      });
    }
  }

  async registrar_recibo() {
    if (this.data_student)
      this.data_student.payment = this.Formpay.get('pay').value;
    console.log(this.data_student.payment);
    const resp = await this._apiService.edit_student(
      this.studentId,
      this.data_student
    );
    console.log(resp);

    if (resp) {
      await Swal.fire({
        icon: 'success',
        title: 'Se realizaron los cambios con éxito',
        confirmButtonColor: '#1D71B8',
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.reset_form();
        }
      });
    }
  }

  reset_form() {
    this.Formpay.reset();
  }

  async edit_course() {
    const selectedCourseId = this.verSeleccion_curso_edit;

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
      const response = await this._apiService.updateStudentCourse(
        this.studentId,
        { courseId: selectedCourseId }
      );

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

  createListado() {
    if (this.students) {
      const pdf = new PdfMakeWrapper();

      const titleTxt = new Txt(`Parroquia Santiago Apóstol de Machachi\n`)
        .fontSize(18)
        .alignment('center')
        .bold().end;

      pdf.add(titleTxt);

      const title2Txt = new Txt(`Catequesis Parroquial\n\n`)
        .fontSize(16)
        .alignment('center')
        .bold().end;

      pdf.add(title2Txt);

      const title3Txt = new Txt(`Listado de Alumnos\n\n`)
        .fontSize(14)
        .alignment('center').end;

      pdf.add(title3Txt);

      const initialTxt = new Txt(`Nivel: ${this.classroom.Level.name}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxt);

      const initialTxtLine2 = new Txt(
        `Horario: ${this.classroom.Schedule.weekDay} (${this.classroom.Schedule.startTime} - ${this.classroom.Schedule.endTime})\n`
      )
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine2);

      const initialTxtLine3 = new Txt(`Paralelo: ${this.classroom.name}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine3);

      const initialTxtLine4 = new Txt(`Periodo: ${this.period}\n\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine4);

      if (this.teachers.length > 0) {
        const teachers_name = this.teachers.map((item) => {
          return [
            item.lastName.toUpperCase(),
            item.name.toUpperCase(),
            item.phone,
          ];
        });

        console.log(teachers_name);

        const tabla_teachers = new Table([...teachers_name])
          .layout('lightHorizontalLines')
          .widths(['auto', 'auto', 'auto'])
          .fontSize(10).end;

        pdf.add(
          new Columns([
            new Txt(`Catequista(s):`)
              .fontSize(12)
              .bold()
              .alignment('left')
              .width('17%').end,
            // new Txt(` `).height(5).end,
            tabla_teachers,
          ]).end
        );
        const espacio = new Txt(` `).height(10).end;
        pdf.add(espacio);
      } else {
        const initialTxtLine7 = new Txt(`Catequistas: No asignados \n\n`)
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine7);
      }

      // Tabla

      const content = this.students.map((item, index) => {
        return [
          (index + 1).toString(),
          item.identityNumber,
          item.lastName.toUpperCase(),
          item.name.toUpperCase(),
          item.age,
          item.phone1,
          this.baptized.transform(item.baptized),
          this.SiNo.transform(item.disability),
          item.payment,
        ];
      });

      pdf.add(
        new Table([
          [
            'N°',
            'Cédula',
            'Apellidos',
            'Nombres',
            'Edad',
            'Contacto',
            'Bautizado',
            'PCD',
            'Recibo',
          ],
          ...content,
        ])
          .layout({
            fillColor: (rowIndex) => {
              // row 0 is the header
              if (rowIndex === 0) {
                return '#D0D3D4';
              }

              return '#ffffff';
            },
          })
          .widths([
            15,
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
            'auto',
          ])
          .fontSize(8).end
      );

      const initialTxtLine8 = new Txt(`\n\n PCD: Persona con discapacidad`)
        .fontSize(7)
        .bold().end;

      pdf.add(initialTxtLine8);

      const pdfName = `Listado_${this.level.Level.name}_${this.classroom.name}.pdf`;
      pdf.create().print();
      //pdf.create().download(pdfName);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }

  exportarAExcel() {
    if (this.students) {
      const nombreArchivo =
        this.level.Level.name +
        ' ' +
        'Paralelo' +
        ' ' +
        this.classroom.name +
        '_' +
        'listado' +
        '.xlsx';
      const tabla = document
        .getElementById('lista_del_curso')
        .cloneNode(true) as HTMLElement;
      tabla.querySelectorAll('tr').forEach((row) => {
        const lastCell = row.lastElementChild;
        if (lastCell) {
          lastCell.remove(); // Elimina la última celda de cada fila
        }
      });

      const hojaDeCalculo = XLSX.utils.table_to_sheet(tabla);
      const libroDeTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        libroDeTrabajo,
        hojaDeCalculo,
        this.level.Level.name + ' Paralelo ' + this.classroom.name
      );
      XLSX.writeFile(libroDeTrabajo, nombreArchivo);
      hojaDeCalculo['cols'] = [
        { width: 10 },
        { width: 15 },
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
      ];
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }

  Export_to_excel() {
    if (this.students) {
      const nombreArchivo = `${this.level.Level.name} Paralelo ${this.classroom.name} periodo ${this.period} listado.xlsx`;

      // Obtén la respuesta de la API (supongamos que está en this.apiResponse)
      const apiResponse = this.students;

      if (this.teachers.length > 0) {
        this.data1 = [
          this.period,
          this.classroom.Level.name,
          this.classroom.Schedule.weekDay +
            ' ' +
            '( ' +
            this.classroom.Schedule.startTime +
            ' - ' +
            this.classroom.Schedule.endTime +
            ' )',
          this.classroom.name,
          `${this.teachers[0].lastName.toUpperCase()} ${this.teachers[0].name.toUpperCase()}`,
          this.teachers[1]
            ? `${this.teachers[1].lastName.toUpperCase()} ${this.teachers[1].name.toUpperCase()}`
            : '',
        ];
      } else {
        this.data1 = [
          this.period,
          this.level.Level.name,
          this.level.weekDay +
            ' ' +
            '( ' +
            this.level.startTime +
            ' - ' +
            this.level.endTime +
            ' )',
          this.classroom.name,
          'No asignado',
        ];
      }
      // Convierte los datos de la respuesta de la API a un formato adecuado para xlsx
      const data = apiResponse.map((item) => [
        item.identityNumber,
        item.name.toUpperCase(),
        item.lastName.toUpperCase(),
        item.age,
        item.phone1,
        this.baptized.transform(item.baptized),
        this.SiNo.transform(item.disability),
        item.payment,
      ]);

      const headers = [
        'Periodo',
        'Nivel',
        'Horario',
        'Paralelo',
        'Catequista(s)',
      ];

      const headers2 = [
        'Cédula',
        'Nombres',
        'Apellidos',
        'Edad',
        'Telefono',
        'Bautizado',
        'Discapacidad',
        'Recibo',
      ];

      const DatosEncabezados = [headers, this.data1, headers2, ...data];
      // Crea una hoja de cálculo a partir de los datos
      const hojaDeCalculo = XLSX.utils.aoa_to_sheet(DatosEncabezados);

      const libroDeTrabajo = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        libroDeTrabajo,
        hojaDeCalculo,
        this.level.Level.name + ' Paralelo ' + this.classroom.name
      );

      // Guarda el archivo Excel
      XLSX.writeFile(libroDeTrabajo, nombreArchivo);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import {
  faSave,
  faTrash,
  faListCheck,
  faX,
  faCalendarDays,
  faEdit,
  faFilePdf,
  faPrint,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup } from '@angular/forms';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
} from '@ng-bootstrap/ng-bootstrap';
import {
  PdfMakeWrapper,
  Txt,
  Table,
  Columns,
  Stack,
  Img,
} from 'pdfmake-wrapper';
import { auto } from '@popperjs/core';
import { datalevel } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-report-attendance',
  templateUrl: './report-attendance.component.html',
  styleUrls: ['./report-attendance.component.css'],
})
export class ReportAttendanceComponent implements OnInit {
  opcionSeleccionada: number = 0;
  verSeleccion: number = 0;
  mycourses: any;
  courses: any;
  students: any;
  name_teacher: any;
  faSave = faSave;
  faTrash = faTrash;
  faListCheck = faListCheck;
  faCalendarDays = faCalendarDays;
  faX = faX;
  faEdit = faEdit;
  faFilePdf = faFilePdf;
  faPrint = faPrint;
  courseId: any;
  fechas: any;
  idStudents: any;
  fechasAsistencias: any;
  asistenciasPorFecha: any = {};
  justificaciones: any[] = [];
  observacionesPorFecha = {};
  studentsWithJustifications: any[] = [];
  processedStudents = new Set();
  principal: any;
  teacher: any;
  Level: any;
  Schedule: any;
  classroom: any;
  ListStudents: any;
  levels: datalevel[] = [];

  getStyles(asistenciaLabel: string): any {
    const styles = {
      A: { backgroundColor: 'rgba(40, 167, 69, 0.5)' },
      F: { backgroundColor: 'rgba(255, 0, 0, 0.5)' },
      J: { backgroundColor: 'rgba(255, 215, 0, 0.5)' },
    };

    if (styles.hasOwnProperty(asistenciaLabel)) {
      return styles[asistenciaLabel];
    } else {
      // Si asistenciaLabel no se encuentra en el objeto styles, puedes devolver un estilo predeterminado o un objeto vacío.
      // Por ejemplo, puedes usar un estilo predeterminado cuando el valor no existe en styles:
      // return styles['default'] || {};
      return {}; // Devuelve un objeto vacío
    }
  }

  constructor(
    private ApiService: ApiService,
    private calendar: NgbCalendar,
  ) {}

  ngOnInit(): void {
    this.loadLevels();
    this.misCursos();
  }

  Attendace_form = new FormGroup({
    presentDate: new FormControl(new Date().toISOString().substring(0, 10)),
  });

  async loadLevels() {
    this.ApiService.getlevel().subscribe((response: any) => {
      this.levels = response.data || response || [];
    });
  }

  getLevelName(levelId: number): string {
    if (!Array.isArray(this.levels)) return '';
    const level = this.levels.find((l) => l.id === levelId);
    return level ? level.name : '';
  }

  capturar() {
    this.verSeleccion = this.opcionSeleccionada;
    console.log(this.verSeleccion);
    this.resetTableData();
    this.listado();
  }

  async misCursos() {
    const resp = await this.ApiService.get_Teacher_info();
    console.log(resp);

    this.mycourses = resp.data.Teacher.Courses;
    this.courses = resp.data.Teacher.Courses;
    this.teacher = resp.data.Teacher;
  }

  async listado() {
    const filtercourse = this.courses.filter(
      (course) => this.verSeleccion === course.id,
    );

    console.log(filtercourse);
    this.courseId = filtercourse[0].id;
    this.principal = filtercourse[0].principalId;
    this.Schedule = filtercourse[0].Schedule;
    this.Level = { name: this.getLevelName(filtercourse[0].levelId) };
    this.classroom = filtercourse[0].name;
    this.ListStudents = filtercourse[0].Students;
    console.log('courseId selecccionado', this.courseId);

    const resp = await this.ApiService.get_report_Assistance(this.courseId);

    // Supongamos que resp.data contiene la respuesta de la API

    const data = resp.data;
    this.fechas = data.map((item) => item.date); // Obtener todas las fechas
    this.students = data[0].students;

    for (const attendance of data) {
      const justifiedStudents = this.getStudentsWithJustifications(
        attendance.students,
      );
      for (const student of justifiedStudents) {
        if (!this.processedStudents.has(student.id)) {
          this.studentsWithJustifications.push(student);
          this.processedStudents.add(student.id);
        }
      }
    }

    // Un objeto para organizar las asistencias por fecha

    // Recorre los datos de la API y organiza las asistencias por fecha
    // for (const asistencia of data) {
    //   const fecha = asistencia.date;
    //   for (const student of asistencia.students) {
    //     const studentId = student.id;
    //     const asistenciaLabel = student.label;

    //   if (!this.asistenciasPorFecha[fecha]) {
    //     this.asistenciasPorFecha[fecha] = {};
    //   }

    //    if (!this.asistenciasPorFecha[fecha][studentId]) {
    //     this.asistenciasPorFecha[fecha][studentId] = asistenciaLabel;
    //   }

    //   }
    // }

    for (const asistencia of data) {
      const fecha = asistencia.date;
      if (!this.asistenciasPorFecha[fecha]) {
        this.asistenciasPorFecha[fecha] = {};
      }
      for (const student of asistencia.students) {
        const studentId = student.id;
        const asistenciaLabel = student.label;
        this.asistenciasPorFecha[fecha][studentId] = asistenciaLabel;

        if (asistenciaLabel === 'J' && student.observation) {
          // Si es una justificación (label 'J') y hay una observación, la agregamos al arreglo de justificaciones
          if (!this.observacionesPorFecha[fecha]) {
            this.observacionesPorFecha[fecha] = {};
          }
          this.observacionesPorFecha[fecha][studentId] = student.observation;
        }
      }
    }

    this.students = data[0].students;
    this.fechasAsistencias = Object.keys(this.asistenciasPorFecha);
    this.justificaciones = Object.keys(this.observacionesPorFecha);

    if (this.students) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: 'success',
        title: 'Preparando listado',
      });
    }
  }

  isDisabled = (date: NgbDate, current: { month: number; year: number }) =>
    date.month !== current.month;
  isWeekend = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;
  isWeek = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;

  getStudentsWithJustifications(students: any[]): any[] {
    return students.filter((student) => student.label === 'J');
  }

  resetTableData() {
    this.asistenciasPorFecha = {};
    this.studentsWithJustifications = [];
    this.processedStudents.clear();
    this.observacionesPorFecha = {};
  }

  exportarReporte(action) {
    console.log('Courses', this.courses);
    if (this.students) {
      const pdf = new PdfMakeWrapper();

      pdf.pageOrientation('landscape');
      pdf.pageMargins([20, 15, 20, 15]); // [left, top, right, bottom]

      const currentDateTime = new Date().toLocaleString();

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

      const title3Txt = new Txt(`Reporte de asistencias del catequista\n\n`)
        .fontSize(14)
        .alignment('center').end;

      pdf.add(title3Txt);

      const initialTxt = new Txt(`Nivel: ${this.Level.name}\n`)
        .fontSize(10)
        .bold().end;

      pdf.add(initialTxt);

      const initialTxtLine2 = new Txt(
        `Horario: ${this.Schedule.weekDay} (${this.Schedule.startTime} - ${this.Schedule.endTime})\n`,
      )
        .fontSize(10)
        .bold().end;

      pdf.add(initialTxtLine2);

      const initialTxtLine3 = new Txt(`Paralelo: ${this.classroom}\n`)
        .fontSize(10)
        .bold().end;

      pdf.add(initialTxtLine3);

      if (this.Schedule.id > 6) {
        const initialTxtLine4 = new Txt(`Periodo: 2025-2026\n\n`)
          .fontSize(10)
          .bold().end;

        pdf.add(initialTxtLine4);
      } else {
        const initialTxtLine5 = new Txt(`Periodo: 2024-2025\n\n`)
          .fontSize(10)
          .bold().end;

        pdf.add(initialTxtLine5);
      }

      if (this.principal === this.teacher.id) {
        const initialTxtLine5 = new Txt(
          `Catequista 1: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(10)
          .bold().end;

        pdf.add(initialTxtLine5);
      } else {
        const initialTxtLine6 = new Txt(
          `Catequista 2: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(10)
          .bold().end;

        pdf.add(initialTxtLine6);
      }

      //Tablas

      const initialTxtLine7 = new Txt(`Registro de asistencias del curso\n\n`)
        .fontSize(9)
        .bold().end;

      pdf.add(initialTxtLine7);

      const content = this.students.map((item, index) => {
        return [
          (index + 1).toString(),
          `${item.lastName.toUpperCase()} ${item.name.toUpperCase()}`,
          ...this.fechasAsistencias.map((fecha) => {
            const asistencia = this.asistenciasPorFecha[fecha][item.id];
            // const observacion = this.observacionesPorFecha[fecha] ? this.observacionesPorFecha[fecha][item.id] : '';
            return new Stack([
              new Columns([
                new Txt(asistencia || '').fontSize(8).alignment('center').end,
                // new Txt(observacion || '').fontSize(8).alignment('center').end
              ]).columnGap(0).end,
            ]).end;
          }),
        ];
      });

      pdf.add(
        new Table([['N°', 'Alumno', ...this.fechasAsistencias], ...content])
          .layout({
            fillColor: (rowIndex) => {
              // row 0 is the header
              if (rowIndex === 0) {
                return '#D0D3D4';
              }

              return '#ffffff';
            },
          })
          .fontSize(8).end,
      );

      //Tabla de justificaciones
      if (this.justificaciones.length > 0) {
        const initialTxtLine8 = new Txt(
          `\n Registro de justificaciones con observaciones\n\n`,
        )
          .fontSize(9)
          .bold().end;

        pdf.add(initialTxtLine8);

        const justifications = this.studentsWithJustifications.map(
          (item, index) => {
            return [
              (index + 1).toString(),
              `${item.lastName.toUpperCase()} ${item.name.toUpperCase()}`,
              ...this.justificaciones.map((fecha) => {
                const observacion = this.observacionesPorFecha[fecha]
                  ? this.observacionesPorFecha[fecha][item.id]
                  : '';
                return new Stack([
                  new Columns([
                    new Txt(observacion || '').fontSize(8).alignment('center')
                      .end,
                  ]).columnGap(0).end,
                ]).end;
              }),
            ];
          },
        );

        const columnWidths = [15, 'auto'];

        // Agrega el ancho para cada fecha
        this.justificaciones.forEach((fecha) => {
          columnWidths.push(80); // Ajusta el ancho según tus necesidades
        });

        pdf.add(
          new Table([
            ['N°', 'Alumno', ...this.justificaciones],
            ...justifications,
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
            .widths(columnWidths)
            .fontSize(8).end,
        );
      } else {
        const initialTxtLine9 = new Txt(
          `\n No se registran justificaciones\n\n`,
        )
          .fontSize(9)
          .bold().end;

        pdf.add(initialTxtLine9);
      }

      //footer
      pdf.footer(
        new Txt(
          `Reporte generado por el Sistema de Gestión de Catequesis, documento oficial - ${currentDateTime}`,
        )
          .alignment('center')
          .fontSize(8)
          .italics().end,
      );

      const pdfName = `Reporte_Asistencia_${this.Level.name}_${this.classroom}.pdf`;
      // pdf.create().download(pdfName);
      if (action === 'download') {
        pdf.create().download(pdfName);
      } else if (action === 'print') {
        pdf.create().print();
      }
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import {
  faArrowAltCircleLeft,
  faPrint,
  faFileExcel,
  faFileExport,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import printJS from 'print-js';
import { ApiService } from 'src/app/services/api.service';
import { BaptizedPipe } from 'src/app/shared/baptized.pipe';
import { SiNoPipe } from 'src/app/shared/si-no.pipe';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { PdfMakeWrapper, Txt, Table, Columns, Stack } from 'pdfmake-wrapper';
import { datalevel } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-list-mycourses',
  templateUrl: './list-mycourses.component.html',
  styleUrls: ['./list-mycourses.component.css'],
  providers: [BaptizedPipe, SiNoPipe],
})
export class ListMycoursesComponent implements OnInit {
  courseId: any;
  courses: any;
  students: any;
  name_course: any;
  name_level: any;
  levels: datalevel[] = [];
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  faPrint = faPrint;
  faFileExcel = faFileExcel;
  faFileExport = faFileExport;
  faFilePdf = faFilePdf;
  data1: any;
  teacher: any;
  Schedule: any;
  principal: any;
  period: string;
  period_parcial_name: string;

  constructor(
    private activateRoute: ActivatedRoute,
    private ApiService: ApiService,
    private baptized: BaptizedPipe,
    private SiNo: SiNoPipe,
  ) {}

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      console.log(parseInt(params['id']));
      this.courseId = parseInt(params['id']);
    });

    this.loadLevels();
    this.getcourses();
  }

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

  async getcourses() {
    const resp = await this.ApiService.get_Teacher_info();
    this.courses = resp.data.Teacher.Courses;
    this.teacher = resp.data.Teacher;

    const filtercourse = this.courses.filter(
      (course) => this.courseId === course.id,
    );

    this.period_parcial_name = filtercourse[0].Schedule.period;
    const currentYear = parseInt(this.period_parcial_name);
    const nextYear = currentYear + 1;
    this.period = `${this.period_parcial_name} - ${nextYear}`;

    this.students = filtercourse[0].Students;

    this.name_course = filtercourse[0].name;
    this.name_level = this.getLevelName(filtercourse[0].levelId);
    this.Schedule = filtercourse[0].Schedule;
    this.principal = filtercourse[0].principalId;

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
      }).then(() => {});
    }
  }

  Export_to_excel() {
    if (this.students) {
      const nombreArchivo = `${this.name_level} Paralelo ${this.name_course} listado.xlsx`;

      // Obtén la respuesta de la API (supongamos que está en this.apiResponse)
      const apiResponse = this.students;

      this.data1 = [
        this.name_level,
        this.name_course,
        this.teacher.name + ' ' + this.teacher.lastName,
      ];

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

      const headers = ['Nivel', 'Paralelo', 'Catequista'];

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
        this.name_level + ' Paralelo ' + this.name_course,
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

      const initialTxt = new Txt(`Nivel: ${this.name_level}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxt);

      const initialTxtLine2 = new Txt(
        `Horario: ${this.Schedule.weekDay} (${this.Schedule.startTime} - ${this.Schedule.endTime})\n`,
      )
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine2);

      const initialTxtLine3 = new Txt(`Paralelo: ${this.name_course}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine3);

      const initialTxtLine4 = new Txt(`Periodo: ${this.period}\n\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine4);

      if (this.principal === this.teacher.id) {
        const initialTxtLine5 = new Txt(
          `Catequista 1: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine5);
      } else {
        const initialTxtLine6 = new Txt(
          `Catequista 2: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine6);
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
          .fontSize(8).end,
      );

      const initialTxtLine8 = new Txt(`\n\n PCD: Persona con discapacidad`)
        .fontSize(7)
        .bold().end;

      pdf.add(initialTxtLine8);

      const pdfName = `Listado_${this.name_level}_${this.name_course}.pdf`;
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

  Generar_PDF() {
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

      const initialTxt = new Txt(`Nivel: ${this.name_level}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxt);

      const initialTxtLine2 = new Txt(
        `Horario: ${this.Schedule.weekDay} (${this.Schedule.startTime} - ${this.Schedule.endTime})\n`,
      )
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine2);

      const initialTxtLine3 = new Txt(`Paralelo: ${this.name_course}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine3);

      const initialTxtLine4 = new Txt(`Periodo: 2023-2024\n\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine4);

      if (this.principal === this.teacher.id) {
        const initialTxtLine5 = new Txt(
          `Catequista 1: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine5);
      } else {
        const initialTxtLine6 = new Txt(
          `Catequista 2: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine6);
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
          .fontSize(8).end,
      );

      const initialTxtLine8 = new Txt(`\n\n PCD: Persona con discapacidad`)
        .fontSize(7)
        .bold().end;

      pdf.add(initialTxtLine8);

      const pdfName = `Listado_${this.name_level}_${this.name_course}.pdf`;
      pdf.create().download(pdfName);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }

  Generar_Listado_casilleros() {
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

      const initialTxt = new Txt(`Nivel: ${this.name_level}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxt);

      const initialTxtLine2 = new Txt(
        `Horario: ${this.Schedule.weekDay} (${this.Schedule.startTime} - ${this.Schedule.endTime})\n`,
      )
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine2);

      const initialTxtLine3 = new Txt(`Paralelo: ${this.name_course}\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine3);

      const initialTxtLine4 = new Txt(`Periodo: 2023-2024\n\n`)
        .fontSize(12)
        .bold().end;

      pdf.add(initialTxtLine4);

      if (this.principal === this.teacher.id) {
        const initialTxtLine5 = new Txt(
          `Catequista 1: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine5);
      } else {
        const initialTxtLine6 = new Txt(
          `Catequista 2: ${this.teacher.name} ${this.teacher.lastName}\n\n`,
        )
          .fontSize(12)
          .bold().end;

        pdf.add(initialTxtLine6);
      }

      // Tabla

      const content = this.students.map((item, index) => {
        return [
          (index + 1).toString(),
          item.lastName.toUpperCase(),
          item.name.toUpperCase(),
          '',
          '',
          '',
          '',
          '',
          '',
        ];
      });

      pdf.add(
        new Table([
          ['N°', 'Apellidos', 'Nombres', ' ', ' ', ' ', ' ', ' ', ' '],
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
          .widths([15, 'auto', 'auto', 20, 20, 20, 20, 20, 80])
          .fontSize(9).end,
      );

      const pdfName = `Listado_${this.name_level}_${this.name_course}.pdf`;
      pdf.create().print();
      // pdf.create().download(pdfName);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe generar primero la lista',
        confirmButtonColor: '#1D71B8',
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { dataStudent } from 'src/app/shared/interfaces';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import { Columns } from 'pdfmake-wrapper';
import { PdfGeneratorService } from '../services/pdf-generator.service';

@Component({
  selector: 'app-verify-information',
  templateUrl: './verify-information.component.html',
  styleUrls: ['./verify-information.component.css'],
})
export class VerifyInformationComponent implements OnInit {
  courseId: number = 0;
  identity_Number: number;
  datos_of_students: dataStudent = {};
  qrCode: any;
  shedules: any;
  courses: any;
  Formstudent: FormGroup;
  student;
  pipe = new DatePipe('en-US');
  fecha = null;
  formattedDate: string;
  current_level_order: number = 0;

  constructor(
    private activateRoute: ActivatedRoute,
    private _apiService: ApiService,
    private Form_builder: FormBuilder,
    private router: Router,
    private pdfGeneratorService: PdfGeneratorService
  ) {
    this.shedules = {};
    this.courses = [];

    this.Formstudent = Form_builder.group({
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
  }

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      // console.log(parseInt(params['id']))
      // console.log(parseInt(params['identityNumber']))
      this.courseId = parseInt(params['id']);
      this.current_level_order = parseInt(params['levelOrder']);
      this.identity_Number = params['identityNumber'];
    });
    this.consultar();
  }

  consultar() {
    this._apiService.getStudent(this.identity_Number).subscribe((resp: any) => {
      this.datos_of_students = resp.data.student;

      this.Formstudent.patchValue({
        lastName: this.datos_of_students.lastName,
        name: this.datos_of_students.name,
        age: this.datos_of_students.age,
        parentName: this.datos_of_students.parentName,
        phone1: this.datos_of_students.phone1,
        email: this.datos_of_students.email,
        address: this.datos_of_students.address,
      });
    });
  }

  async enroll_student(values: any) {
    try {
      const AuxValue = {
        lastName: values.lastName,
        name: values.name,
        age: values.age,
        parentName: values.parentName,
        phone1: values.phone1,
        email: values.email,
        address: values.address,
        institutionId: this.courseId,
        levelOrder: this.current_level_order,
      };

      console.log(AuxValue);

      const resp = await this._apiService.updateAndEnrollStudent(
        this.datos_of_students.id,
        AuxValue
      );
      // console.log(resp);
      if (resp) {
        const myTimeout = setTimeout(() => {
          Swal.fire({
            title: 'Matrícula Exitosa',
            text:
              'Estimada/o' +
              ' ' +
              AuxValue.name +
              ' ' +
              AuxValue.lastName +
              ' ' +
              'se han registrado tus datos. Puedes tomar captura del cógido QR para que tengas tu comprobante de matrícula y puedas revisar toda tu información. A continuación, descarga tu Acta de Compromiso.',
            imageUrl: resp.data.qrCode,
            imageWidth: 200,
            imageHeight: 200,
            imageAlt: 'Custom image',
            confirmButtonText: 'Descargar Acta de Compromiso',
            confirmButtonColor: '#1D71B8',
          }).then((result) => {
            if (result.isConfirmed) {
              this._apiService
                .getStudent(this.identity_Number)
                .subscribe((resp_student: any) => {
                  console.log('respuesta data', resp_student.data);
                  this.student = resp_student.data.student;
                  this.qrCode = resp_student.data.qrCode;
                  this.formattedDate = this.formatUpdatedAt(
                    this.student.updatedAt
                  );
                  this.createPDF(false);
                  localStorage.clear();
                  this.router.navigate(['/home']);
                });
            }
          });
        }, 1000);
        myTimeout;
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.log(error);
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
        this.student,
        this.pipe,
        this.formattedDate,
        isCopy ? 'copia' : 'original',
        this.qrCode
      )
      .subscribe((voucher) => {
        const pdf = pdfMake.createPdf(voucher);
        pdf.open();
        pdf.download(
          'Acta de Compromiso' +
            ' ' +
            this.student.lastName +
            ' ' +
            this.student.name +
            '.pdf'
        );
      });
  }

  // createPDF() {
  //   const voucher: any = {
  //     pageSize: 'A4',
  //     footer:
  //       'Acta de Compromiso y Comprobante generado por Sistema de matriculación - Este Documento es Oficial' +
  //       ' ' +
  //       this.today,
  //     content: [
  //       {
  //         image: 'header',
  //         width: 550,
  //         alignment: 'center',
  //       },

  //       {
  //         text: 'Acta de Compromiso - Comprobante\n\n',
  //         style: 'header',
  //         alignment: 'center',
  //         color: 'red',
  //         margin: [0, 20, 0, 0],
  //       },

  //       {
  //         columns:[
  //           {
  //             text: 'Datos de Matriculación - Periodo: 2023-2024\n\n',
  //             style: 'subheader',
  //             margin: [10, 0],
  //           },
  //           {
  //             image: 'qrCode',
  //             width: 70,
  //             alignment: 'center',
  //           },
  //         ]
  //       },
  //       {
  //         style: 'tableExample',
  //         table: {
  //           body: [
  //             ['Fecha', 'C.I.', 'Nombre del Estudiante', 'Nivel', 'Paralelo'],
  //             [
  //               (this.fecha = this.pipe.transform(Date.now(), 'dd/MM/yyyy')),
  //               this.student.identityNumber,
  //               this.student.lastName + ' ' + this.student.name,
  //               this.student.Course.Schedule.Level.name,
  //               this.student.Course.name,
  //             ],
  //           ],
  //         },
  //         margin: [10, 0],
  //       },

  //       {
  //         text: [
  //           'Yo' +
  //             ' ' +
  //             this.student.parentName +
  //             ',' +
  //             ' ' +
  //             'como Padre/Madre/Representante de mi hijo/a, ',
  //           { text: 'me comprometo: \n\n', fontSize: 12, bold: true },
  //         ],
  //         margin: [10, 20],
  //       },
  //       {
  //         ul: [
  //           'A ser el primer portavoz en la educación en la Fe, preocupándome de su educación cristiana, estando pendiente de su asistencia ya sea virtual o presencial. Teniendo presente que si mi hijo/a tiene tres faltas perderá el nivel y deberá repetirlo en un nuevo periodo.',
  //           'A estar pendiente de la presentación de actividades y tareas que el catequista envíe y considere necesarias dentro del proceso de formación.',
  //           'A participar activamente de las reuniones de Padres de Familia que se planifiquen.',
  //           'A justificar oportunamente las inasistencias de mi representado.',
  //           'A colaborar con mi testimonio de vida cristiana a la experiencia de la Fe mi hijo/a, dando a Dios su debido lugar en mi Familia.',
  //           'A participar activamente de la Eucaristía Dominical en mi Parroquia junto a mi Familia.',
  //         ],
  //         alignment: 'justify',
  //         margin: [50, 0, 35, 0],
  //         fontSize: 12,
  //       },
  //       {
  //         text: [
  //           '____________________________________\n ',
  //           'Firma del Representante\n\n',
  //           'C.I.: ____________________',
  //         ],
  //         alignment: 'center',
  //         margin: [10, 60, 10, 58],
  //       },
  //       {
  //         image: 'footer',
  //         width: 590,
  //         alignment: 'center',
  //       },
  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 18,
  //         bold: true,
  //       },
  //       subheader: {
  //         fontSize: 15,
  //         bold: true,
  //       },
  //       quote: {
  //         italics: true,
  //       },
  //       small: {
  //         fontSize: 8,
  //       },
  //     },
  //     images: {
  //       header:

  //       footer:

  //         qrCode: this.qrCode,
  //     },
  //   };
  //   const pdf = pdfMake.createPdf(voucher);
  //   pdf.open();
  //   pdf.download(
  //     'Acta de Compromiso' +
  //       ' ' +
  //       this.student.lastName +
  //       ' ' +
  //       this.student.name +
  //       '.pdf'
  //   );
  // }
}

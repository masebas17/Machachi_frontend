import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validator,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseComponentComponent } from '../admin/course-component/course-component.component';
import { ApiService } from '../services/api.service';
import { datacourses, datashedule, dataStudent } from '../shared/interfaces';
import Swal from 'sweetalert2';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import PDF from 'pdfmake/build/pdfmake';
import PDF_Fonts from 'pdfmake/build/vfs_fonts';
import { DatePipe, NgForOf } from '@angular/common';
import { PdfGeneratorService } from '../services/pdf-generator.service';

PDF.vfs = PDF_Fonts.pdfMake.vfs;

@Component({
  selector: 'app-enrollment-form',
  templateUrl: './enrollment-form.component.html',
  styleUrls: ['./enrollment-form.component.css'],
})
export class EnrollmentFormComponent implements OnInit {
  student: dataStudent = {};
  courseId: number = 0;
  institutionId: number = 0;
  pipe = new DatePipe('en-US');
  fecha = null;
  datos_of_students: any;
  formattedDate: string;
  qrCode: any;

  constructor(
    private _formbuilder: FormBuilder,
    private _apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private pdfGeneratorService: PdfGeneratorService
  ) {}

  signupForm = new FormGroup({
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

  ngOnInit() {
    this.activateRoute.params.subscribe((params) => {
      console.log(parseInt(params['id']));
      this.institutionId = parseInt(params['id']);
    });
  }

  // async registrar(values: any) {
  //   this.student = values;
  //   this.student.courseId = this.courseId;
  //   console.log(this.student);

  //   const resp = await this._apiService.enrollemnt(this.student);
  //   if (resp === undefined) {
  //     const myTimeout = setTimeout(() => {
  //       this.router.navigate(['/home']);
  //     }, 6000);
  //     myTimeout;
  //   }

  //   console.log(resp);
  //   this.datos_of_students = resp.data.enrolledStudent;
  //   this.qrCode = resp.data.qrCode;

  //   // console.log(this.datos_of_students);
  //   if (resp) {
  //     const myTimeout = setTimeout(() => {
  //       Swal.fire({
  //         text:
  //           'Estimada/o' +
  //           ' ' +
  //           this.student.name +
  //           ' ' +
  //           this.student.lastName +
  //           ' ' +
  //           'se han registrado tus datos. Puedes tomar captura del cógido QR para que tengas tu comprobante de matrícula y puedas revisar toda tu información. A continuación, descarga tu Acta de Compromiso.',
  //         imageUrl: resp.data.qrCode,
  //         imageWidth: 200,
  //         imageHeight: 200,
  //         imageAlt: 'Custom image',
  //         confirmButtonText: 'Descargar Acta de Compromiso',
  //         confirmButtonColor: '#1D71B8',
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           this.formattedDate = this.formatUpdatedAt(
  //             this.datos_of_students.updatedAt
  //           );
  //           this.createPDF(false);
  //           localStorage.clear();
  //           this.router.navigate(['/home']);
  //         }
  //       });
  //     }, 1000);
  //     myTimeout;
  //   } else {
  //     this.router.navigate(['/home']);
  //   }
  // }

  async registrar(values: any) {
    const levelOrder = parseInt(
      localStorage.getItem('nivel_habilitado') || '1',
      10
    );

    const payload = {
      ...values,
      institutionId: this.institutionId,
      levelOrder,
    };

    try {
      const resp = await this._apiService.auto_enrollment(payload);
      this.datos_of_students = resp.data.enrolledStudent;
      this.qrCode = resp.data.qrCode;

      Swal.fire({
        text:
          'Estimada/o ' +
          payload.name +
          ' ' +
          payload.lastName +
          ', se han registrado tus datos. Puedes tomar captura del código QR como comprobante de matrícula. A continuación, descarga tu Acta de Compromiso.',
        imageUrl: this.qrCode,
        imageWidth: 200,
        imageHeight: 200,
        imageAlt: 'Código QR',
        confirmButtonText: 'Descargar Acta de Compromiso',
        confirmButtonColor: '#1D71B8',
      }).then((result) => {
        if (result.isConfirmed) {
          this.formattedDate = this.formatUpdatedAt(
            this.datos_of_students.updatedAt
          );
          this.createPDF(false); // 📄 Tu función actual de PDF
          localStorage.clear();
          this.router.navigate(['/home']);
        }
      });
    } catch (error: any) {
      const mensaje =
        error?.error?.message ||
        'Hubo un problema al registrar tus datos. Por favor, intenta más tarde.';
      Swal.fire('Error', mensaje, 'error');
      this.router.navigate(['/home']);
    }
  }

  get form() {
    return this.signupForm.controls;
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
}

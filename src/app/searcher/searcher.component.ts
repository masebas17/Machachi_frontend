import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe } from '@angular/common';
import { text } from '@fortawesome/fontawesome-svg-core';
import { PdfGeneratorService } from '../services/pdf-generator.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.css'],
})
export class SearcherComponent implements OnInit {
  today: Date = new Date();
  pipe = new DatePipe('en-US');
  fecha = null;
  datos_of_students: any;
  display = 'none';
  formattedDate: string;
  qrCode: any;
  period: string;

  constructor(
    private _ApiService: ApiService,
    private router: Router,
    private pdfGeneratorService: PdfGeneratorService
  ) {}

  Form = new FormGroup({
    identityNumber: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
  });

  ngOnInit(): void {}

  consultar() {
    this._ApiService
      .getStudent(this.Form.get('identityNumber').value)
      .subscribe((resp: any) => {
        this.datos_of_students = resp.data.student;

        //console.log(this.datos_of_students);

        if (resp) {
          const myTimeout = setTimeout(async () => {
            this.qrCode = resp.data.qrCode;
            this.formattedDate = this.formatUpdatedAt(
              this.datos_of_students.updatedAt
            );
            const currentYear = parseInt(
              this.datos_of_students.Course.Schedule.period
            );
            const nextYear = currentYear + 1;
            this.period = `${this.datos_of_students.Course.Schedule.period} - ${nextYear}`;
            const Toast = Swal.mixin({
              toast: false,
              position: 'center',
              showConfirmButton: false,
              timer: 6000,
              timerProgressBar: true,
            });
            await Toast.fire({
              icon: 'success',
              title: 'Datos del Estudiante encontrados',
              text: ' Generando Reporte',
            });
            this.opemmodalDialog();
          }, 500);
          myTimeout;
        } else {
          this.router.navigate(['/home']);
        }
      });
  }

  //  const myTimeout = setTimeout(() => {
  //    Swal.fire({
  //      title: 'Datos del Estudiante encontrados',
  //      icon: 'success',
  //      confirmButtonColor: '#1D71B8',
  //      confirmButtonText: 'ok',
  //    }).then((result) => {
  //      if (result.isConfirmed) {
  //       this.opemmodalDialog()
  //      }
  //    })
  //  }, 1000);
  //  myTimeout;

  //   Swal.fire({
  //     title: 'Datos del Estudiante',
  //     icon: 'info',
  //     confirmButtonColor: '#1D71B8',
  //     confirmButtonText: 'Revisar el Acta de Compromiso',
  //     showCancelButton: true,
  //     cancelButtonText: 'Salir',
  //     cancelButtonColor: 'red',
  //       html:
  //       'Cédula de identidad:' + ' '+ resp.data.identityNumber + '<br>' +
  //       'Nombre:' + ' ' + resp.data.lastName + ' ' +resp.data.name +'<br>' +
  //       'Nivel:' + ' '+ resp.data.Course.Schedule.Level.name +'<br>' +
  //       'Horario:' + ' ' + resp.data.Course.Schedule.weekDay + ' ' + resp.data.Course.Schedule.startTime + ' ' + '-'+ ' ' + resp.data.Course.Schedule.endTime + '<br>' +
  //       'Paralelo:' + ' ' + resp.data.Course.name + '<br>' +
  //       'Catequista:' + ' ' + ' No Asignado',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.createPDF()
  //     }
  //       this.router.navigate(['/home'])
  //   })
  // }, 1000);
  // myTimeout;

  opemmodalDialog() {
    this.display = 'block';
  }

  onCloseHandled() {
    this.display = 'none';
    Swal.fire({
      title: '¿Desea realizar una nueva Consulta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Nueva Consulta',
      cancelButtonText: 'Salir',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.reload();
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire('', '¡Consulta realizada con éxito!', 'success');
        this.router.navigate(['/home']);
      }
    });
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

  generatePDF() {
    if (this.datos_of_students.Course.Schedule.period !== '2025') {
      Swal.fire({
        icon: 'info',
        text: 'No registra una matricula en este periodo 2025-2026, no puede generar el Acta de Compromiso. Debe acercarse a las oficinas del Despacho Parroquial.',
        confirmButtonColor: '#1D71B8',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.createPDF(true);
    }
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
            this.datos_of_students.lastName +
            ' ' +
            this.datos_of_students.name +
            '.pdf'
        );
      });
  }

  // createPDF(){

  //   const voucher: any = {
  //     pageSize: 'A4',
  //     footer:'Acta de Compromiso y Comprobante generado por Sistema de matriculación desde las consultas - Este Documento es Oficial' + ' ' + this.today,
  //     content: [
  //       {
  //         image: 'header',
  //         width: 550,
  //         alignment: 'center'
  //       },
  //       {
  //         text: 'Acta de Compromiso - Comprobante\n\n',
  //         style: 'header',
  //         alignment: 'center',
  //         color: 'red'
  //       },
  //       {
  //         text: 'Datos de Matriculación - Periodo: 2023-2024\n\n',
  //         style: 'subheader',
  //         margin:[10,0]
  //       },
  // 	      {
  // 	      	style: 'tableExample',
  // 		      table: {
  // 			    body: [
  // 				['Fecha','C.I.', 'Nombre del Estudiante','Nivel','Paralelo'],
  // 				[this.fecha = this.pipe.transform(Date.now(), 'dd/MM/yyyy'),this.datos_of_students.identityNumber, this.datos_of_students.lastName + ' ' + this.datos_of_students.name , this.datos_of_students.Course.Schedule.Level.name,this.datos_of_students.Course.name],
  // 			]
  // 		},
  //     margin: [10,0]
  // 	},

  //   {
  // 		text: [
  // 			'Yo' + ' '+ this.datos_of_students.parentName+','+' '+'como Padre/Madre/Representante de mi hijo/a, ',
  // 			{text: 'me comprometo: \n\n', fontSize: 12, bold: true},
  // 		],
  //     margin: [10, 20]
  // 	},
  // 	{
  // 		ul: [
  // 			'A ser el primer portavoz en la educación en la Fe, preocupándome de su educación cristiana, estando pendiente de su asistencia ya sea virtual opresencial. Teniendo presente que si mi hijo/a tiene tres faltas perderá el nivel y deberá repetirlo en un nuevo periodo.',
  // 			'A estar pendiente de la presentación de actividades y tareas que el catequista envíe y considere necesarias dentro del proceso de formación.',
  // 			'A participar activamente de las reuniones de Padres de Familia que se planifiquen.',
  //       'A justificar oportunamente las inasistencias de mi representado.',
  //       'A colaborar con mi testimonio de vida cristiana a la experiencia de la Fe mi hijo/a, dando a Dios su debido lugar en mi Familia.',
  //       'A participar activamente de la Eucaristía Dominical en mi Parroquia junto a mi Familia.'
  // 		],
  //     alignment: 'justify',
  //     margin: [50, 0, 35, 0],
  //     fontSize: 12,
  // 	},
  //   {
  // 		text: [
  // 			'____________________________________\n ',
  //       'Firma del Representante\n\n',
  //       'C.I.: ____________________'
  //     ],
  //     alignment: 'center',
  //     margin: [10, 60, 10, 60]
  // 	},
  //   {
  //     image: 'footer',
  //     width: 600,
  //     alignment: 'center',
  //   },
  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 18,
  //         bold: true
  //       },
  //       subheader: {
  //         fontSize: 15,
  //         bold: true
  //       },
  //       quote: {
  //         italics: true
  //       },
  //       small: {
  //         fontSize: 8
  //       }
  //     },
  //     images: {
  //       header:
  //       footer:
  //   }
  // }
  //   const pdf = pdfMake.createPdf(voucher)
  //   pdf.open()
  //   pdf.download("Acta de Compromiso" + " " + this.datos_of_students.lastName + ' ' + this.datos_of_students.name + ".pdf")
  // }
}

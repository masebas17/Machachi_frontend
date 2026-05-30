import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { PdfMakeWrapper, Stack, Txt } from 'pdfmake-wrapper';
import { HttpClient } from '@angular/common/http';
import { configurePdfFonts } from 'src/app/pdf/pdf-font-config';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-enrollment-report',
  templateUrl: './enrollment-report.component.html',
  styleUrls: ['./enrollment-report.component.css'],
})
export class EnrollmentReportComponent implements OnInit {
  opcion_periodo: string = '';
  opcionHorario: number = 0;
  opcionCurso: number = 0;
  schedules: any[] = [];
  courses: any[] = [];
  enrollments: any[] = [];
  firmaParrocoBase64: string = '';
  headerDiplomaBase64: string = '';
  logoVerticalBase64: string = '';
  backgroundImageBase64: string = '';
  coordinatorSignatureBase64: string = '';
  fontsReady = false;
  fechaTemp: string = '';
  fechasPorCurso: { [key: number]: string } = {};
  Object = Object;

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    await configurePdfFonts();

    this.fontsReady = true;

    this.http
      .get('assets/pdf-images/firma-pDiego.txt', { responseType: 'text' })
      .subscribe((data) => (this.firmaParrocoBase64 = data));

    this.http
      .get('assets/pdf-images/header-diplomas.txt', { responseType: 'text' })
      .subscribe((data) => (this.headerDiplomaBase64 = data));

    this.http
      .get('assets/pdf-images/pin-vertical-diplomas.txt', {
        responseType: 'text',
      })
      .subscribe((data) => (this.logoVerticalBase64 = data));

    this.http
      .get('assets/pdf-images/background-diploma-marco.txt', {
        responseType: 'text',
      })
      .subscribe((data) => (this.backgroundImageBase64 = data));

    this.http
      .get('assets/pdf-images/firma-coordinador.txt', {
        responseType: 'text',
      })
      .subscribe((data) => (this.coordinatorSignatureBase64 = data));
  }

  async capturarPeriodo() {
    const resp = await this.apiService.getschedules_from_year(
      this.opcion_periodo
    );
    this.schedules = resp.data;
    this.opcionHorario = 0;
    this.opcionCurso = 0;
    this.enrollments = [];
  }

  async capturarHorario() {
    const resp = await this.apiService.getCoursesbyid(this.opcionHorario);
    this.courses = resp.data;
    this.opcionCurso = 0;
    this.enrollments = [];
  }

  async capturarCurso() {
    const resp = await this.apiService.getEnrollmentsByCourse(this.opcionCurso);
    this.enrollments = resp.data;
  }

  updateEnrollmentStatus(enrollment: any): void {
    if (!enrollment.newStatus || enrollment.newStatus === enrollment.status)
      return;

    const payload = { status: enrollment.newStatus };

    this.apiService
      .updateStudentEnrollmentStatus(enrollment.id, payload)
      .subscribe({
        next: () => {
          enrollment.status = enrollment.newStatus;
          enrollment.newStatus = null;
          this.toastr.success('Se ha marcado a un alumno como aprobado');
          if (this.opcionCurso) {
            this.capturarCurso(); // Actualiza la lista de inscripciones
          }
        },
        error: (err) => {
          console.error('Error al actualizar el estado', err);
          this.toastr.error('Se ha marcado a un alumno como reprobado');
        },
      });
  }

  guardarFechaCurso(): void {
    if (!this.opcionCurso || !this.fechaTemp) {
      this.toastr.warning('Seleccione un curso y una fecha');
      return;
    }

    const [year, month, day] = this.fechaTemp.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const fechaFormato = new Intl.DateTimeFormat('es-ES', opciones).format(fecha);

    this.fechasPorCurso[this.opcionCurso] = fechaFormato.charAt(0).toUpperCase() + fechaFormato.slice(1);
    this.toastr.success(`Fecha guardada para el curso ${this.opcionCurso}`);
    this.fechaTemp = '';
  }

  obtenerFechaActual(): string {
    return this.fechasPorCurso[this.opcionCurso] || '';
  }

  obtenerFechasConfiguradasList(): any[] {
    return Object.entries(this.fechasPorCurso).map(([cursoId, fecha]) => ({
      cursoId: parseInt(cursoId),
      fecha: fecha
    }));
  }

  generateCertificates() {
    const pdf = new PdfMakeWrapper();
    pdf.pageSize('A4');
    pdf.pageMargins([0, 0, 0, 0]);

    const nombreNivelDiploma: { [key: string]: string } = {
      'R.P.B.': 'Renovación de Promesas Bautismales',
      Iniciación: 'Iniciación',
      Reconciliación: 'Reconciliación',
      Eucaristía: 'Eucaristía',
      'Año Bíblico': 'Año Bíblico',
      Confirmación: 'Confirmación',
    };

    const aprobados = this.enrollments.filter((e) => e.status === 'Aprobado');

    for (let i = 0; i < aprobados.length; i += 2) {
      for (let j = 0; j < 2; j++) {
        const enrollment = aprobados[i + j];
        if (!enrollment) continue;

        const alumno =
          `${enrollment.Student.lastName} ${enrollment.Student.name}`.toUpperCase();
        const nivelBase = enrollment.Course.Level.name;
        const nivelDiploma = nombreNivelDiploma[nivelBase] || nivelBase;
        const periodoBase = enrollment.Course.Schedule.period;
        const periodo = `${periodoBase} - ${parseInt(periodoBase) + 1}`;
        const fechaDiploma = this.fechasPorCurso[enrollment.Course.id] || 'Fecha pendiente';

        // pdf.add({
        //   absolutePosition: { x: 30, y: 25 + j * 421 },
        //   image: this.logoVerticalBase64,
        //   width: 100,
        //   height: 421,
        // });

        // 🔷 LUEGO el contenido del diploma
        pdf.add({
          absolutePosition: { x: 130, y: 40 + j * 421 }, // desplazamos el stack hacia la derecha
          width: 450,
          alignment: 'center',
          stack: [
            new Txt('Parroquia Santiago Apóstol de Machachi')
              .bold()
              .fontSize(20)
              .alignment('center')
              .margin([0, 10]).end,
            new Txt('CERTIFICA')
              .fontSize(20)
              .alignment('center')
              .font('Caprasimo')
              .color('#0073C6')
              .margin([0, 10]).end,
            new Txt('Que el (la) niño(a):')
              .fontSize(10)
              .alignment('center')
              .margin([0, 5]).end,
            new Txt(alumno)
              .bold()
              .fontSize(16)
              .alignment('center')
              .margin([0, 5]).end,
            new Txt([
              'Ha culminado con responsabilidad el nivel de: ',
              { text: nivelDiploma.toUpperCase(), bold: true },
            ])
              .fontSize(12)
              .alignment('center')
              .margin([0, 5]).end,
            new Txt([
              'Correspondiente al período: ',
              { text: periodo, bold: true },
            ])
              .fontSize(12)
              .alignment('center')
              .margin([0, 5]).end,
            new Txt(`Machachi, ${fechaDiploma}`)
              .fontSize(12)
              .alignment('center')
              .margin([0, 10, 0, 10]).end,

            {
              columns: [
                {
                  stack: [
                    { text: '________________________', alignment: 'center' },
                    {
                      image: this.firmaParrocoBase64,
                      width: 150,
                      alignment: 'center',
                      margin: [0, -50, 0, 0],
                    },
                    {
                      text: 'P. Diego Tanicuchí',
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, -18, 0, 0],
                    },
                    {
                      text: 'Párroco de Machachi',
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, -2, 0, 0],
                    },
                  ],
                  width: '50%',
                },
                {
                  stack: [
                    { text: '________________________', alignment: 'center' },
                    {
                      image: this.coordinatorSignatureBase64,
                      width: 135,
                      alignment: 'center',
                      margin: [0, -55, 0, 0],
                    },
                    {
                      text: 'Coordinador de Catequesis',
                      alignment: 'center',
                      fontSize: 8,
                      margin: [0, -20, 0, 0],
                    },
                  ],
                  width: '50%',
                },
              ],
              margin: [0, 40, 0, 0],
            },

            enrollment.qr
              ? {
                  image: enrollment.qr.qrBase64,
                  width: 40,
                  alignment: 'center',
                  margin: [0, 2, 0, 0],
                }
              : null,

            new Txt('Generado por el Sistema de Catequesis - Documento oficial')
              .fontSize(6)
              .alignment('center')
              .italics()
              .margin([0, -2, 0, 0]).end,
          ],
        });

        pdf.add({
          absolutePosition: { x: 0, y: j * 421 },
          image: this.backgroundImageBase64,
          width: 595,
          height: 421,
        });
      }

      // 🔷 Línea de corte horizontal entre los 2 diplomas
      pdf.add({
        absolutePosition: { x: 40, y: 421 },
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 0.5,
            dash: { length: 5 },
          },
        ],
      });

      if (i + 2 < aprobados.length) {
        pdf.add({ text: '', pageBreak: 'after' });
      }
    }

    pdf.create().print();
  }
}

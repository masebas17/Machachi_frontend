import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { color } from 'html2canvas/dist/types/css/types/color';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  today = new Date();

  constructor(private http: HttpClient) {}

  private loadImage(path: string): Observable<string> {
    return this.http
      .get(path, { responseType: 'text' })
      .pipe(map((base64) => base64));
  }

  generatePDF(
    student: any,
    pipe: any,
    formattedDate: string,
    documentType?: 'original' | 'copia',
    qrCode?: string
  ): Observable<any> {
    return forkJoin({
      header: this.loadImage('assets/pdf-images/header-pdf.txt'),
      footer: this.loadImage('assets/pdf-images/footer-pdf.txt'),
    }).pipe(
      map((images) => {
        const footerText =
          documentType === 'copia'
            ? 'Copia del Acta de Compromiso - Generado por Sistema de matriculación - Este Documento es Oficial'
            : 'Acta de Compromiso y Comprobante generado por Sistema de matriculación - Este Documento es Oficial';

        return {
          pageSize: 'A4',
          footer: footerText + ' ' + this.today,
          content: [
            {
              image: 'header',
              width: 550,
              alignment: 'center',
            },
            {
              text: 'Acta de Compromiso - Comprobante\n\n',
              style: 'header',
              alignment: 'center',
              color: 'red',
              margin: [0, 10, 0, 0],
            },
            {
              text: 'Datos de Matriculación - Periodo: 2025-2026\n\n',
              style: 'subheader',
              margin: [10, 0],
            },
            {
              columns: [
                {
                  stack: [
                    {
                      text: [{ text: 'Fecha: ', bold: true }, formattedDate],
                    },
                    {
                      text: [
                        { text: 'C.I.: ', bold: true },
                        student.identityNumber,
                      ],
                    },
                    {
                      text: [
                        { text: 'Nombre: ', bold: true },
                        student.name + ' ' + student.lastName,
                      ],
                    },
                    {
                      text: [
                        { text: 'Nivel: ', bold: true },
                        { text: student.Course.Level.name, bold: true },
                      ],
                    },
                    {
                      text: [
                        {
                          text: `Paralelo: ${student.Course.name} ${
                            student.Course.Institution?.name
                              ? '- ' + student.Course.Institution.name
                              : ''
                          }`,
                          bold: true,
                        },
                      ],
                    },
                    {
                      text: [
                        {
                          text: '\n *Nota: El curso fue asignado automáticamente por el sistema como una nueva forma de manejar la matrícula y los cursos por edades.',
                          fontSize: 6,
                          italics: true,
                          bold: true,
                        },
                      ],
                    },
                  ],
                  margin: [10, 5],
                },
                {
                  stack: [
                    {
                      image: 'qrCode',
                      width: 100,
                      alignment: 'center',
                    },
                  ],
                  margin: [10, 5],
                },
              ],
            },
            {
              text: [
                'Yo' + ' ',
                { text: student.parentName, bold: true },
                ',' + ' ' + 'como Padre/Madre/Representante de mi hijo/a, ',
                { text: 'me comprometo a: \n\n', fontSize: 12, bold: true },
              ],
              margin: [10, 10],
            },
            {
              ul: [
                'Ser el primer portavoz en la educación en la Fe, preocupándome de su educación cristiana, estando pendiente de su asistencia ya sea virtual o presencial. Teniendo presente que si mi hijo/a tiene tres faltas perderá el nivel y deberá repetirlo en un nuevo periodo.',
                'Estar pendiente de la presentación de actividades y tareas que el catequista envíe y considere necesarias dentro del proceso de formación.',
                'Participar activamente de las reuniones de Padres de Familia que se planifiquen.',
                'Justificar oportunamente las inasistencias de mi representado.',
                'Colaborar con mi testimonio de vida cristiana a la experiencia de la Fe mi hijo/a, dando a Dios su debido lugar en mi Familia.',
                'Participar activamente de la Eucaristía Dominical en mi Parroquia junto a mi Familia.',
              ],
              alignment: 'justify',
              margin: [50, 0, 35, 0],
              fontSize: 11,
            },
            {
              text: [
                '____________________________________\n ',
                'Firma del Representante\n\n',
                'C.I.: ____________________',
              ],
              alignment: 'center',
              margin: [10, 60, 10, 58],
            },
            {
              image: 'footer',
              width: 590,
              alignment: 'center',
            },
          ],
          styles: {
            header: {
              fontSize: 16,
              bold: true,
            },
            subheader: {
              fontSize: 14,
              bold: true,
            },
            quote: {
              italics: true,
            },
            small: {
              fontSize: 8,
            },
          },
          images: {
            header: images.header,
            footer: images.footer,
            qrCode: qrCode,
          },
        };
      })
    );
  }
}

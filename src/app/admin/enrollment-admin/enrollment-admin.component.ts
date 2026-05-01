import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { datacourses } from 'src/app/shared/interfaces';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-enrollment-admin',
  templateUrl: './enrollment-admin.component.html',
  styleUrls: ['./enrollment-admin.component.css'],
})
export class EnrollmentAdminComponent implements OnInit {
  datos_of_students: any;
  current_level;
  aux_level;
  levels: any;
  validDate;
  course: any;
  seleccion_curso: number = 0;
  verSeleccion_curso;
  student;
  today: Date = new Date();
  pipe = new DatePipe('en-US');
  fecha = null;
  formattedDate: string;
  qrCode: any;
  dataEnrollmentStudent: any;
  enrollmentStatus: any;
  lastLevel: any;
  institutions: any[];
  selectedInstitutionId: number | null = null;
  availableCourses: any[] = [];
  selectedCourseId: number | null = null;

  constructor(
    private router: Router,
    private _ApiService: ApiService,
    private pdfGeneratorService: PdfGeneratorService
  ) {
    this.course = [];
  }

  ngOnInit(): void {
    this.getInstitutions();
    this.getLevels();
  }

  FormIdentitynumber = new FormGroup({
    identityNumber: new FormControl('', [
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
    payment: new FormControl('', Validators.required),
  });

  async consultar() {
    try {
      const identityNumber =
        this.FormIdentitynumber.get('identityNumber').value;
      const resp: any = await this._ApiService
        .getStudent(identityNumber)
        .toPromise();

      if (!resp?.data?.student || !resp?.data?.latestEnrollment) {
        this.router.navigate(['/home']);
        return;
      }

      const student = resp.data.student;
      const latestEnrollment = resp.data.latestEnrollment;

      const ok = await this.verificar_datos_admin(student, latestEnrollment);
      if (!ok) return;

      await Swal.fire({
        icon: 'success',
        title: 'Datos del Estudiante encontrados',
        text: 'Puede proceder a realizar la matrícula.',
        timer: 2000,
        showConfirmButton: false,
      });

      this.datos_of_students = student;

      // Parchar el formulario
      this.Formstudent.patchValue({
        lastName: student.lastName,
        name: student.name,
        age: student.age,
        parentName: student.parentName,
        phone1: student.phone1,
        email: student.email,
        address: student.address,
        payment: null,
      });

      this.getCourse(); // cargar cursos disponibles
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        text: 'Error consultando datos del estudiante',
      });
    }
  }

  getShedule() {
    this._ApiService.getShedulebyYear().subscribe((resp: any) => {
      console.log(resp), (this.levels = resp.data);
      console.log(this.levels);
    });
  }

  async getCourse() {
    const resp = await this._ApiService.getcourses_from_admin(
      this.current_level.id
    );
    this.course = resp.data;
    console.log(this.course);
    this.seleccion_curso = 0;
  }

  capturar_curso() {
    this.verSeleccion_curso = this.seleccion_curso;
    console.log(this.verSeleccion_curso);
  }

  async enroll_student(values: any) {
    if (this.selectedCourseId != 0) {
      const AuxValue = {
        lastName: values.lastName,
        name: values.name,
        age: values.age,
        parentName: values.parentName,
        phone1: values.phone1,
        email: values.email,
        address: values.address,
        institutionId: this.selectedInstitutionId,
        courseId: this.selectedCourseId,
        payment: null,
        aproved: null,
      };

      console.log(AuxValue);

      const resp = await this._ApiService.updateAndenrollmentAdmin(
        this.datos_of_students.id,
        AuxValue
      );
      console.log(resp);

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
              this._ApiService
                .getStudent(this.FormIdentitynumber.get('identityNumber').value)
                .subscribe((resp_student: any) => {
                  console.log(resp_student.data);
                  this.student = resp_student.data.student;
                  this.qrCode = resp_student.data.qrCode;
                  this.formattedDate = this.formatUpdatedAt(
                    this.student.updatedAt
                  );
                  this.createPDF(false);
                  this.router.navigate(['/admin']);
                });
            }
          });
        }, 1000);
        myTimeout;
      } else {
        this.router.navigate(['/home']);
      }
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
      });
  }

  async verificar_datos_admin(
    student: any,
    latestEnrollment: any
  ): Promise<boolean> {
    if (
      !latestEnrollment ||
      !latestEnrollment.Course ||
      !latestEnrollment.Course.Level
    ) {
      await Swal.fire({
        icon: 'error',
        text: 'No se encontró información del último nivel del alumno.',
      });
      return false;
    }

    const enrollmentStatus = latestEnrollment.status;
    const lastLevel = latestEnrollment.Course.Level;

    const currentOrder = Number(lastLevel.order);
    const nextLevel =
      this.levels?.find(
        (lvl: any) => Number(lvl?.order) === currentOrder + 1
      ) || null;

    if (!nextLevel) {
      await Swal.fire({
        icon: 'warning',
        text: 'No hay un siguiente nivel definido para matrícula.',
      });
      return false;
    }

    // Reprobado
    if (enrollmentStatus === 'Reprobado') {
      await Swal.fire({
        icon: 'error',
        text: 'El usuario registra nivel REPROBADO, no tiene permitido matricularse.',
        footer: 'Debe corregir el estado antes de matricular al alumno.',
      });
      return false;
    }

    // Último nivel completado
    if (lastLevel.order === 6) {
      await Swal.fire({
        icon: 'error',
        text: 'El estudiante ya terminó el último nivel (CONFIRMACIÓN), no puede matricularse.',
      });
      return false;
    }

    if (latestEnrollment.Course.Schedule.period === '2025') {
      await Swal.fire({
        icon: 'error',
        text: 'El estudiante ya está matriculado en este periodo',
      });
      return false;
    }

    this.dataEnrollmentStudent = latestEnrollment;
    this.lastLevel = lastLevel;
    this.enrollmentStatus = enrollmentStatus;
    this.current_level = nextLevel;

    return true;
  }

  getLevels() {
    this._ApiService.getlevel().subscribe((resp: any) => {
      this.levels = resp.data;
    });
  }

  getInstitutions() {
    this._ApiService.getInstitutions().subscribe((resp: any) => {
      this.institutions = resp.data;
      console.log(this.institutions);
    });
  }

  onInstitutionSelect() {
    const storedLevelOrder = this.current_level.order;

    if (!this.selectedInstitutionId) {
      Swal.fire(
        'Atención',
        'Debes seleccionar una institución válida',
        'warning'
      );
      return;
    }

    if (!this.current_level) {
      Swal.fire(
        'Error',
        'No se ha definido el nivel para la matriculación',
        'error'
      );
      return;
    }

    const levelOrder = parseInt(storedLevelOrder, 10);

    this._ApiService
      .getAvailableCourses(this.selectedInstitutionId, levelOrder)
      .then((resp: any) => {
        const courses = resp?.data || [];

        if (courses.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin cupos disponibles',
            text: 'No hay cursos habilitados para esta institución en el nivel actual.',
          });
          return;
        }

        this.availableCourses = courses;
      });
  }
}

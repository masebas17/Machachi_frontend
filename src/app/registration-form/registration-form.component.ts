import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css'],
})
export class RegistrationFormComponent implements OnInit {
  datos_of_students: any;
  current_level: any;
  aux_level: any;
  levels: any;
  validDate: any;

  enrollmentStatus: any;
  dataEnrollmentStudent: any;
  lastLevel: any;

  institutions: any[] = [];
  selectedInstitution: any = null;
  availableCourses: any[] = [];

  storedLevelOrder: any;

  constructor(private router: Router, private _ApiService: ApiService) {
    this.levels = [];
  }

  FormIdentitynumber = new FormGroup({
    identityNumber: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
  });

  ngOnInit(): void {
    // this.getShedule();
    this.getActiveEnrollmentLevels();
    this.loadInstitutions();
  }

  verificar() {
    const myTimeout = setTimeout(async () => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'center',
        showConfirmButton: false,
        color: '#3d9b24',
        width: 600,
        padding: '2em',
        timer: 5000,
        timerProgressBar: true,
      });

      await Toast.fire({
        icon: 'success',
        title: 'Validando la información del alumno',
      });
      this.router.navigate(['/registration-form']);
    }, 1000);
    myTimeout;
  }

  async consultar() {
    try {
      const identityNumber =
        this.FormIdentitynumber.get('identityNumber').value;
      const resp: any = await this._ApiService
        .getStudent(identityNumber)
        .toPromise();

      if (!resp?.data?.student) {
        this.router.navigate(['/home']);
        return;
      }

      const student = resp.data.student;
      const latestEnrollment = resp.data.latestEnrollment;

      const ok = await this.verificar_datos(student, latestEnrollment);
      if (!ok) return;

      await Swal.fire({
        icon: 'success',
        title: 'Datos del Estudiante encontrados',
        text: 'Verificando el estado de matriculación',
        timer: 2000,
        showConfirmButton: false,
      });

      this.datos_of_students = student;
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: 'error',
        text: 'Error consultando datos del estudiante',
      });
    }
  }

  // getShedule() {
  //   this._ApiService.getShedulebyYear().subscribe((resp: any) => {
  //     console.log(resp), (this.levels = resp.data);
  //     console.log('levels', this.levels);
  //   });
  // }

  getActiveEnrollmentLevels() {
    this._ApiService.getActiveEnrollmentLevels().subscribe((resp: any) => {
      this.levels = resp.data;
      console.log('Active Enrollment Levels', this.levels);
    });
  }

  async verificar_datos(student: any, latestEnrollment: any): Promise<boolean> {
    this.enrollmentStatus = latestEnrollment?.status;
    this.dataEnrollmentStudent = latestEnrollment;
    this.lastLevel = latestEnrollment?.Course?.Level;

    // 1) Ya matriculado 2025
    if (student?.Course?.Schedule?.period === '2025') {
      await Swal.fire({
        icon: 'error',
        text: 'El Usuario ya se encuentra matriculado',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    // 2) Reprobado
    if (this.enrollmentStatus === 'Reprobado') {
      await Swal.fire({
        icon: 'error',
        text: 'El usuario registra nivel REPROBADO, no tiene permitido matricularse.',
        footer: 'Nota: Debe acercarse al Despacho parroquial',
      });
      window.location.reload();
      return false;
    }

    // 3) No Aprobado
    if (this.enrollmentStatus !== 'Aprobado') {
      await Swal.fire({
        icon: 'error',
        text: 'El usuario no puede matricularse porque no ha aprobado el último nivel.',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    // 4) Sin último nivel
    if (!this.lastLevel) {
      await Swal.fire({
        icon: 'error',
        text: 'No se encontró el último nivel del alumno.',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    // 5) Fin de catequesis
    if (this.lastLevel?.order === 6) {
      await Swal.fire({
        icon: 'error',
        text: 'El Usuario no puede matricularse porque el último nivel aprobado es CONFIRMACION, ya terminó la catequesis.',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    // 6) Periodo previo debe ser 2024
    if (student?.Course?.Schedule?.period !== '2024') {
      await Swal.fire({
        icon: 'error',
        title: 'El usuario no se puede matricular.',
        text: 'No registra matrícula en el periodo anterior 2024-2025.',
        footer: 'Nota: Debe acercarse al Despacho Parroquial',
      });
      window.location.reload();
      return false;
    }

    // 7) Siguiente nivel (order + 1) entre los habilitados hoy
    const currentOrder = Number(this.lastLevel?.order);
    const nextLevel =
      this.levels?.find(
        (lvl: any) => Number(lvl?.order) === currentOrder + 1
      ) || null;

    if (!nextLevel) {
      await Swal.fire({
        icon: 'warning',
        text: 'No esta habilitado para la matrícula en este día; Revisar las fechas correspondientes.',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    // 8) Ventana de matrícula
    const now = new Date();
    const start = new Date(nextLevel.enrollmentStart);
    const end = new Date(nextLevel.enrollmentEnd);

    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      await Swal.fire({
        icon: 'error',
        text: 'Las fechas de matrícula del nivel seleccionado no son válidas.',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    const validDate = now >= start && now <= end;
    if (!validDate) {
      await Swal.fire({
        icon: 'error',
        title:
          'El Usuario no está habilitado para la matriculación en este día.',
        text: 'Revise las fechas correspondientes',
      });
      this.router.navigate(['/level-form-selection']);
      return false;
    }

    // OK
    this.validDate = true;
    this.current_level = nextLevel;
    return true;
  }

  consult_courses(event: any) {
    if (this.current_level.id != 0) {
      localStorage.setItem('cs', event.target.name);
      this.router.navigate([
        '/classroom_selection',
        event.target.name,
        this.datos_of_students.identityNumber,
      ]);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Debe seleccionar un horario',
      });
    }
  }

  loadInstitutions() {
    this._ApiService.getInstitutions().subscribe(
      (resp: any) => {
        this.institutions = resp.data;
      },
      (error) => {
        console.error('Error al obtener instituciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las instituciones', 'error');
      }
    );
  }

  onInstitutionSelect() {
    const storedLevelOrder = this.current_level.order;

    if (!this.selectedInstitution) {
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
      .getAvailableCourses(this.selectedInstitution.id, levelOrder)
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
        // this.router.navigate(['/enrollment', this.selectedInstitution.id]);
        localStorage.setItem('en', this.selectedInstitution.id);
        this.router.navigate([
          '/verify_information',
          this.selectedInstitution.id,
          this.current_level.order,
          this.datos_of_students.identityNumber,
        ]);
      })
      .catch((error) => {
        console.error('Error al obtener cursos disponibles:', error);
        Swal.fire(
          'Error',
          'No se pudieron cargar los cursos disponibles',
          'error'
        );
      });
  }
}

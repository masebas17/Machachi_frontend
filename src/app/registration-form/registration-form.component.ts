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
  current_level;
  aux_level;
  levels: any;
  validDate;

  enrollmentStatus;
  dataEnrollmentStudent: any;

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

  consultar() {
    this._ApiService
      .getStudent(this.FormIdentitynumber.get('identityNumber').value)
      .subscribe((resp: any) => {
        if (resp && resp.data && resp.data.student) {
          console.log('resp', resp.data.student);

          const myTimeout = setTimeout(async () => {
            const student = resp.data.student;
            this.dataEnrollmentStudent = resp.data.latestEnrollment;

            const Toast = Swal.mixin({
              toast: false,
              position: 'center',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });

            if (student.Course.Schedule.period === '2025') {
              await Swal.fire({
                icon: 'error',
                text: 'El Usuario ya se encuentra matriculado',
              });
              this.router.navigate(['/level-form-selection']);
              return;
            }

            this.verificar_datos(student);

            if (!this.validDate) {
              await Swal.fire({
                icon: 'error',
                title:
                  'El Usuario no está habilitado para la matriculación en este día.',
                text: 'Revise las fechas correspondientes',
              });
              this.router.navigate(['/level-form-selection']);
              return;
            }

            // Validar si el periodo no es 2024
            if (student.Course.Schedule.period !== '2024') {
              await Swal.fire({
                icon: 'error',
                title: 'El usuario no se puede matricular.',
                text: 'No registra matrícula en el periodo anterior 2023-2024.',
                footer: 'Nota: Debe acercarse al Despacho Parroquial',
              });
              window.location.reload();
              return;
            }

            // Validar si el usuario está aprobado
            if (this.enrollmentStatus === 'Reprobado') {
              await Swal.fire({
                icon: 'error',
                text: 'El usuario registra nivel REPROBADO, no tiene permitido matricularse.',
                footer: 'Nota: Debe acercarse al Despacho parroquial',
              });
              window.location.reload();
              return;
            }

            // Si todas las validaciones son correctas
            await Toast.fire({
              icon: 'success',
              title: 'Datos del Estudiante encontrados',
              text: 'Verificando el estado de matriculación',
            });

            this.datos_of_students = student;

            console.log(this.datos_of_students);
          }, 500);
          myTimeout;
        } else {
          this.router.navigate(['/home']);
        }
      });
  }

  getShedule() {
    this._ApiService.getShedulebyYear().subscribe((resp: any) => {
      console.log(resp), (this.levels = resp.data);
      console.log('levels', this.levels);
    });
  }

  getActiveEnrollmentLevels() {
    this._ApiService.getActiveEnrollmentLevels().subscribe((resp: any) => {
      this.levels = resp.data;
      console.log('Active Enrollment Levels', this.levels);
    });
  }

  verificar_datos(datos_of_students: any) {
    this.enrollmentStatus = this.dataEnrollmentStudent.status;

    if (this.enrollmentStatus !== 'Aprobado') {
      Swal.fire({
        icon: 'error',
        text: 'El usuario no puede matricularse porque no ha aprobado el último nivel.',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/level-form-selection']);
        }
      });
      return;
    }

    const auxlevel = this.levels.find(
      (level_order) =>
        level_order.order === datos_of_students.Course.Level.order + 1
    );

    if (auxlevel) {
      console.log('Objeto encontrado:', auxlevel);
      this.current_level = auxlevel;
    }

    if (!auxlevel) {
      Swal.fire({
        icon: 'error',
        text: 'El Usuario no puede matricularse porque el último nivel aprobado es CONFIRMACION, ya terminó la catequesis',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/level-form-selection']);
        }
      });
    }

    const auxDate = new Date();

    // console.log(auxDate)
    // console.log(new Date(this.current_level.Level.enrollmentStart))
    // console.log(new Date(this.current_level.Level.enrollmentEnd))

    if (
      auxDate >= new Date(this.current_level.enrollmentStart) &&
      auxDate <= new Date(this.current_level.enrollmentEnd)
    ) {
      this.validDate = true;
    } else {
      this.validDate = false;
    }
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
        console.log('Instituciones cargadas:', this.institutions);
      },
      (error) => {
        console.error('Error al obtener instituciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las instituciones', 'error');
      }
    );
  }

  onInstitutionSelect() {
    console.log('level', this.current_level);

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

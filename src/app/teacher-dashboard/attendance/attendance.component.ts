import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import {
  faSave,
  faTrash,
  faListCheck,
  faX,
  faCalendarDays,
  faEdit,
  faArrowAltCircleLeft,
} from '@fortawesome/free-solid-svg-icons';
import {
  CheckboxControlValueAccessor,
  FormControl,
  FormGroup,
} from '@angular/forms';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDate,
} from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { datalevel } from 'src/app/shared/interfaces';

interface Person {
  id: number;
  name: string;
  checkboxState: 'checked' | 'unchecked' | 'indeterminate';
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css'],
})
export class AttendanceComponent implements OnInit {
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
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  currentD = new Date();
  model: NgbDateStruct | null = null;
  model1: NgbDateStruct | null = null;
  date: { year: number; month: number };
  marcarAsistencia = false;
  alumno: any;
  courseId: any;
  LevelId: any;

  name_course: any;
  name_level: any;
  levels: datalevel[] = [];

  minAttendanceDate: NgbDateStruct = { year: 2025, month: 10, day: 1 };
  maxAttendanceDate: NgbDateStruct = { year: 2026, month: 6, day: 30 };
  minEditDate: NgbDateStruct = { year: 2025, month: 10, day: 1 };
  maxEditDate: NgbDateStruct = { year: 2026, month: 6, day: 30 };

  mostrarBotonseleccionar: boolean = true;
  mostrarBotondeseleccion: boolean = false;

  List: number[] = [];
  selectedStudentIds;
  IDStudents;
  BtnCargarDatos: boolean = false;

  constructor(
    private ApiService: ApiService,
    private calendar: NgbCalendar,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      console.log(parseInt(params['id']));
      this.courseId = parseInt(params['id']);
    });

    this.misCursos();
    this.loadLevels();
    this.alumno = false;
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
    this.listado();
  }

  async misCursos() {
    const resp = await this.ApiService.get_Teacher_info();
    console.log(resp);

    this.mycourses = resp.data.Teacher.Courses;
    this.courses = resp.data.Teacher.Courses;

    this.listado();
  }

  async listado() {
    const filtercourse = this.courses.filter(
      (course) => this.courseId === course.id,
    );

    this.students = filtercourse[0].Students;

    console.log('Estudiantes', this.students);

    this.name_course = filtercourse[0].name;
    this.name_level = this.getLevelName(filtercourse[0].levelId);
    this.LevelId = filtercourse[0].Schedule.id;

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

  //isDisabled = (date: NgbDate, current: { month: number; year: number }) => date.month !== current.month;
  // isWeekend = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;
  //isWeek = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;

  isDisabled = (date: NgbDate, current: { month: number; year: number }) =>
    date.month !== current.month;

  isWeek = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;

  isWeekend = (date: NgbDate) => {
    const weekday = this.calendar.getWeekday(date);
    // Permite solo jueves (4), viernes (5), sábado (6) y domingo (7)
    return ![4, 5, 6, 7].includes(weekday);
  };

  toggleCheckbox(person: Person) {
    if (person.checkboxState === 'checked') {
      person.checkboxState = 'unchecked';
    } else if (person.checkboxState === 'unchecked') {
      person.checkboxState = 'indeterminate';
    } else {
      person.checkboxState = 'checked';
    }
  }

  seleccionarTodos() {
    for (this.alumno of this.students) {
      this.alumno.value = true;
      if (!this.isSelected(this.alumno.id)) {
        this.List.push(this.alumno.id);
      }
    }
    this.toastr.success('Se ha seleccionado a todos los alumnos');
    console.log('todos los alumnos seleccionados:', this.List);
    this.mostrarBotonseleccionar = false;
    this.mostrarBotondeseleccion = true;
  }

  DesmarcarTodos() {
    for (this.alumno of this.students) {
      this.alumno.value = false;
      this.List = this.List.filter((id) => id !== this.alumno.id);
    }
    this.toastr.warning('Se ha quitado a todos los alumnos');
    console.log('todos los alumnos quitados:', this.List);

    this.mostrarBotonseleccionar = true;
    this.mostrarBotondeseleccion = false;
  }

  excluirMutuamente(checkboxSeleccionado, otroCheckbox) {
    if (checkboxSeleccionado) {
      otroCheckbox = false; // Desmarca el otro checkbox si se selecciona el actual
    }
  }

  toggleAsistencia(studentId: number) {
    if (this.isSelected(studentId)) {
      // Si el estudiante ya estaba seleccionado, lo eliminamos del arreglo
      this.List = this.List.filter((id) => id !== studentId);
      this.toastr.warning('Se ha quitado de la lista al Estudiante');
    } else {
      // Si el estudiante no estaba seleccionado, lo agregamos al arreglo
      this.List.push(studentId);
      this.toastr.success('Se ha tomado lista del Estudiante');
    }
    console.log('Estudiante agregado:', this.List);
  }

  isSelected(studentId: number): boolean {
    // Verificamos si un estudiante está en el arreglo de estudiantes seleccionados
    return this.List.includes(studentId);
  }

  formatDate(date: NgbDateStruct): string {
    if (date) {
      const year = date.year.toString().padStart(4, '0');
      const month = date.month.toString().padStart(2, '0');
      const day = date.day.toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return ''; // Manejo de caso en que date sea nulo o indefinido
  }

  canSaveAttendance(): boolean {
    return (
      this.model !== null &&
      this.List.length > 0 &&
      this.isDateInAllowedRange(this.model)
    );
  }

  isDateInAllowedRange(date: NgbDateStruct): boolean {
    if (!date) {
      return false;
    }
    const timestamp = new Date(date.year, date.month - 1, date.day).getTime();
    const minTimestamp = new Date(
      this.minAttendanceDate.year,
      this.minAttendanceDate.month - 1,
      this.minAttendanceDate.day,
    ).getTime();
    const maxTimestamp = new Date(
      this.maxAttendanceDate.year,
      this.maxAttendanceDate.month - 1,
      this.maxAttendanceDate.day,
    ).getTime();
    return timestamp >= minTimestamp && timestamp <= maxTimestamp;
  }

  async guardarAsistencia() {
    const fechaSeleccionada = this.formatDate(this.model);
    console.log('Fecha seleccionada en formato yyyy-mm-dd:', fechaSeleccionada);
    if (!fechaSeleccionada) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha requerida',
        text: 'Debe seleccionar una fecha válida antes de guardar la asistencia.',
        confirmButtonColor: '#1D71B8',
      });
      return;
    }

    if (this.List.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Selección requerida',
        text: 'Debe seleccionar al menos un alumno para registrar la asistencia.',
        confirmButtonColor: '#1D71B8',
      });
      return;
    }

    if (!this.isDateInAllowedRange(this.model)) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha fuera de rango',
        text: 'La fecha debe estar entre octubre de 2025 y junio de 2026.',
        confirmButtonColor: '#1D71B8',
      });
      return;
    }

    const data = {
      students: this.List,
      date: fechaSeleccionada,
      courseId: this.courseId,
    };

    console.log('array de envio:', data);

    const resp = await this.ApiService.Assistance(data);
    console.log(resp);

    if (resp) {
      const myTimeout = setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Se ha guardado la Asistencia con éxito',
          text:
            'Registro del día:' +
            ' ' +
            fechaSeleccionada +
            ' ' +
            this.name_level +
            '-' +
            this.name_course,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#1D71B8',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }, 1000);
      myTimeout;
    } else {
      const myTimeout = setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Asistencia ya existente',
          text: 'Ya existe una asitencia registrada con la fecha ingresada',
          // confirmButtonText: 'Aceptar',
          confirmButtonColor: '#1D71B8',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/teacher/mycourses']);
          }
        });
      }, 1000);
      myTimeout;
    }
  }

  async consultar_asistencia1(event: any) {
    const fecha_editar = this.formatDate(this.model1);
    console.log('Fecha seleccionada en formato yyyy-mm-dd:', fecha_editar);

    const resp = await this.ApiService.get_Assistance(
      this.courseId,
      fecha_editar,
    );
    console.log(resp);

    if (resp.correctProcess === true) {
      const myTimeout = setTimeout(() => {
        console.log(event.target.name);
        Swal.fire({
          icon: 'success',
          title: 'Se ha encontrado la asistencia del día seleccionado',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#1D71B8',
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.setItem('en', event.target.name);
            this.router.navigate([
              '/teacher/edit-attendance/',
              event.target.name,
              this.formatDate(this.model1),
            ]);
          }
        });
      }, 1000);
      myTimeout;
    } else {
      const myTimeout = setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Ups',
          text: resp.message,
          confirmButtonText: 'Ok',
          confirmButtonColor: '#1D71B8',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      }, 1000);
      myTimeout;
    }
  }

  consultar_asistencia(event: any) {}

  // toggleAsistencia2(student: any) {
  //   for (this.alumno of this.students) {
  //     student.alumno.value = !student.alumno.value;
  //   }

  // }

  verificarFechaSeleccionada(date: NgbDate): void {
    const fechaSeleccionada = `${date.year}-${date.month}-${date.day}`;

    // Obtener la fecha actual
    const fechaActual = new Date();

    // Calcular la diferencia en milisegundos
    const diferenciaEnMilisegundos =
      fechaActual.getTime() - new Date(fechaSeleccionada).getTime();

    // Calcular el límite de dos semanas en milisegundos
    const dosSemanasEnMilisegundos = 15 * 24 * 60 * 60 * 1000;

    if (diferenciaEnMilisegundos <= dosSemanasEnMilisegundos) {
      // La fecha es editable, abrir una nueva pestaña o realizar la acción deseada.
      // Puedes agregar tu lógica aquí.
      this.toastr.success(
        'Se puede editar la asistencia en la fecha seleccionada',
        'Correcto',
      );
      this.BtnCargarDatos = true;

      console.log(
        'La fecha es editable, puedes abrir una nueva pestaña o realizar la acción deseada.',
      );
    } else {
      // La fecha no es editable, muestra un mensaje de error.
      this.toastr.error(
        'No es posible editar la asistencia de esta fecha',
        'Error',
      );
      this.BtnCargarDatos = false;
      console.log('La fecha no es editable, muestra un mensaje de error.');
    }
  }

  eliminar() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: '¿Estás Seguro?',
        text: 'Se va a reiniciar la toma de asistencia',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, reiniciar!',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
  }
}

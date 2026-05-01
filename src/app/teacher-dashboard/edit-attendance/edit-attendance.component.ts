import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { List } from 'pdfmake-wrapper/lib/definitions/list/list';
import { JustifyType } from 'src/app/shared/interfaces';
import { datalevel } from 'src/app/shared/interfaces';

interface Person {
  id: number;
  name: string;
  checkboxState: 'checked' | 'unchecked' | 'indeterminate';
}

@Component({
  selector: 'app-edit-attendance',
  templateUrl: './edit-attendance.component.html',
  styleUrls: ['./edit-attendance.component.css'],
})
export class EditAttendanceComponent implements OnInit, AfterViewInit {
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
  model: NgbDateStruct;
  model1: NgbDateStruct;
  date: { year: number; month: number };
  marcarAsistencia = false;
  alumno: any;
  courseId: any;

  name_course: any;
  name_level: any;
  levels: datalevel[] = [];

  mostrarBotonseleccionar: boolean = true;
  mostrarBotondeseleccion: boolean = false;

  List: number[] = [];
  ListJustification: any[] = [];
  selectedStudentIds: any;
  IDStudents: number[] = [];
  edit_date: any;
  justifyStudentsId: any;
  IDStudentsJustify: any[] = [];

  Justify: {};
  observation: string = '';
  textareaEnabled: { [key: number]: boolean } = {};

  JustifyStudents: any[] = [];
  idsjustify: number[] = [];

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
      ((this.courseId = parseInt(params['id'])),
        (this.edit_date = params['date']));
    });

    this.misCursos();
    this.loadLevels();
    this.consultar_asistencia();
    this.alumno = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showEditTutorial();
    }, 300);
  }

  Attendace_form = new FormGroup({
    presentDate: new FormControl(new Date().toISOString().substring(0, 10)),
  });

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

  async listado() {
    const filtercourse = this.courses.filter(
      (course) => this.courseId === course.id,
    );

    this.students = filtercourse[0].Students;

    console.log('Estudiantes', this.students);

    this.name_course = filtercourse[0].name;
    this.name_level = this.getLevelName(filtercourse[0].levelId);

    // if(this.students){
    //   const Toast = Swal.mixin({
    //     toast: true,
    //     position: 'top-end',
    //     showConfirmButton: false,
    //     timer: 2000,
    //     timerProgressBar: true,
    //   })
    //    Toast.fire({
    //     icon: 'success',
    //     title: 'Preparando listado'
    //   })
    // }
  }

  isDisabled = (date: NgbDate, current: { month: number; year: number }) =>
    date.month !== current.month;
  isWeekend = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;
  isWeek = (date: NgbDate) => this.calendar.getWeekday(date) <= 5;

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
    console.log('todos los alumnos seleccionados:', this.List);
    this.mostrarBotonseleccionar = false;
    this.mostrarBotondeseleccion = true;
  }

  DesmarcarTodos() {
    for (this.alumno of this.students) {
      this.alumno.value = false;
      this.List = this.List.filter((id) => id !== this.alumno.id);
    }
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
    } else {
      // Si el estudiante no estaba seleccionado, lo agregamos al arreglo
      this.List.push(studentId);
      this.toastr.info('Se ha colocado asistencia a un estudiante');
    }
    console.log('Estudiante agregado:', this.List);
  }

  isSelected(studentId: number): boolean {
    // Verificamos si un estudiante está en el arreglo de estudiantes seleccionados
    return this.List.includes(studentId);
  }

  // toggleJustification(studentId: number) {
  //   if (this.isSelectedJustification(studentId)) {
  //     // Si el estudiante ya estaba seleccionado, lo eliminamos del arreglo
  //     this.textareaEnabled[studentId] = false;
  //     this.ListJustification = this.ListJustification.filter(id => id !== studentId);

  //   } else {
  //     // Si el estudiante no estaba seleccionado, lo agregamos al arreglo
  //     // this.ListJustification.push(studentId);
  //     this.ListJustification.push({id: studentId, observation: this.observation});
  //     this.textareaEnabled[studentId] = true;
  //     this.toastr.warning('Se ha Justificado a un estudiante');
  //   }

  //   const student = this.IDStudentsJustify.find(student => student.id === studentId);
  //   if (student) {
  //     student.observation = this.observation;
  //     this.textareaEnabled[student.id] = true;
  //   }

  //   console.log('Estudiante Justificado:', this.ListJustification)
  // }

  async toggleJustification(studentId: number) {
    const isStudentIdInIdsJustify = this.idsjustify.includes(studentId);

    if (isStudentIdInIdsJustify) {
      // Si el estudiante ya estaba seleccionado, lo eliminamos del arreglo
      this.idsjustify = this.idsjustify.filter((id) => id !== studentId);
    } else {
      // Si el estudiante no estaba seleccionado, lo agregamos al arreglo
      this.idsjustify.push(studentId);
    }

    const student = this.ListJustification.find(
      (item) => item.id === studentId,
    );

    if (student) {
      const studentIndex = this.ListJustification.indexOf(student);
      // Si el estudiante ya estaba justificado, lo eliminamos del arreglo
      this.ListJustification.splice(studentIndex, 1);
      this.textareaEnabled[studentId] = false;
      this.toastr.warning('Se ha quitado a un estudiante');
      // if (studentIndex !== -1) {
      // }
      this.Justify = {};
      this.students.find((student) => student.id === studentId).observation =
        '';
      this.idsjustify = this.idsjustify.filter((id) => id !== studentId);
    } else {
      // Si el estudiante no estaba justificado, lo agregamos al arreglo
      // this.ListJustification.push({ id: studentId, observation: this.observation });
      this.textareaEnabled[studentId] = true;
      this.toastr.info('Se ha iniciado un proceso de justificación');
      Swal.fire({
        icon: 'warning',
        title: 'Justificación',
        text: 'Tiene que ingresar una observación para justificar al estudiante',
      });
    }
    console.log('ids pre Justificados:', this.idsjustify);
    console.log('Estudiantes con asistencia', this.List);
    console.log('Estudiantes Justificados:', this.ListJustification);
  }

  isSelectedJustification(studentId: number): boolean {
    // Verificamos si un estudiante está en el arreglo de estudiantes seleccionados
    return this.ListJustification.includes(studentId);
  }

  onTextareaInput(event: any) {
    // Función para rastrear cambios en el textarea
    this.observation = event.target.value;
  }

  truncateObservation(student: any) {
    if (student.observation && student.observation.length > 80) {
      student.observation = student.observation.slice(0, 80);
      this.toastr.info(
        'Se ha excedido el límite de 80 caracteres. El texto ha sido truncado.',
        'Límite alcanzado',
      );
    }
  }

  showEditTutorial() {
    Swal.fire({
      title: 'Tutorial de observaciones',
      icon: 'info',
      html:
        '<p>Al editar una justificación, escriba solo lo esencial y concreto.</p>' +
        '<p>Ejemplo: <strong>Se presenta justificación médica con fecha: aprobada por el coordinador</strong></p>' +
        '<p>No explique mucho la idea; capture solo el motivo y su aprobación.</p>',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1D71B8',
    });
  }

  Justification(studentId: number, observation: string) {
    if (!observation || observation.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Justificación',
        text: 'No esta lleno el campo de Observación',
      });
    } else if (observation.length > 80) {
      Swal.fire({
        icon: 'error',
        title: 'Observación demasiado larga',
        text: 'La observación no puede superar los 80 caracteres.',
      });
    } else {
      this.Justify = {
        id: studentId,
        observation: observation,
      };

      this.ListJustification.push(this.Justify);

      Swal.fire({
        icon: 'success',
        text: 'Se guardó la observación del alumno, puede proceder a guardar los cambios totales',
      });

      console.log('Estudiantes Justificados:', this.ListJustification);
    }
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

  async EditarAsistencia() {
    const estudiantesConCheckboxMarcadoSinObservacion = this.idsjustify.filter(
      (studentId) => {
        return !this.ListJustification.some((item) => item.id === studentId);
      },
    );

    console.log(
      'estudiantes con checkbox marcado sin observación:',
      estudiantesConCheckboxMarcadoSinObservacion,
    );

    const ListRepetidos = this.List.filter((studentId) =>
      this.ListJustification.some((item) => item.id === studentId),
    );

    console.log('estudiantes con ambos checks marcados:', ListRepetidos);

    if (ListRepetidos.length > 0) {
      Swal.fire({
        icon: 'error',
        text: 'No se puede registrar a un catequizando con asistencia y justificación al mismo tiempo',
      });
      // .then((result) => {
      //     if (result.isConfirmed) {
      //       window.location.reload();
      //       }
      //    })
    } else if (estudiantesConCheckboxMarcadoSinObservacion.length > 0) {
      Swal.fire({
        icon: 'error',
        text: 'No esta registrando correctamente una justificación',
      });
    } else {
      // alert('Se puede registrar');
      console.log('estudiantes antes de ingreso:', this.List);
      console.log('justificación antes de ingreso:', this.ListJustification);

      const data = {
        students: this.List,
        justifiedStudents: this.ListJustification,
      };

      console.log('array de envio:', data);

      const resp = await this.ApiService.Update_Assistance(
        this.courseId,
        this.edit_date,
        data,
      );
      console.log(resp);

      if (resp.correctProcess === true) {
        const myTimeout = setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Se ha editado la Asistencia con éxito',
            text:
              'Edición del día:' +
              ' ' +
              this.edit_date +
              ' ' +
              this.name_level +
              '-' +
              this.name_course,
            confirmButtonText: 'Aceptar',
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
  }

  async consultar_asistencia() {
    const resp = await this.ApiService.get_Assistance(
      this.courseId,
      this.edit_date,
    );
    console.log(resp);

    if (resp.data.assistance.Students) {
      this.selectedStudentIds = resp.data.assistance.Students;
      this.IDStudents = this.selectedStudentIds.map((id) => id.id);
      this.List = this.IDStudents;
    }

    if (resp.data.justification != null) {
      this.justifyStudentsId = resp.data.justification.StudentJustifications;
      this.IDStudentsJustify = this.justifyStudentsId.map((student) => ({
        id: student.studentId,
        observation: student.observation,
      }));
      this.ListJustification = this.IDStudentsJustify;
    }

    console.log(this.ListJustification);
  }

  checkboxDeberiaEstarMarcado(id: number): boolean {
    const studentsJustify = this.IDStudents ?? [];
    return studentsJustify.includes(id);
  }

  // checkboxjustification(id: number): boolean {
  //   const studentsJustify = this.IDStudentsJustify ?? [];
  //   return studentsJustify.includes(id);
  //  }

  checkboxjustification(id: number): {
    isJustified: boolean;
    observation: string;
  } {
    const studentJustification = this.IDStudentsJustify.find(
      (student) => student.id === id,
    );

    if (studentJustification) {
      return {
        isJustified: true,
        observation: studentJustification.observation,
      };
    } else {
      return {
        isJustified: false,
        observation: '',
      };
    }
  }

  updateObservation2(studentId: number, event: any) {
    this.observation = event.target.value;
    console.log('observación:', this.observation);
    this.Justify = {
      id: studentId,
      observation: this.observation,
    };
    //  console.log('array justificación:', this.Justify)
    const student = this.IDStudentsJustify.find(
      (student) => student.id === studentId,
    );
    if (student) {
      student.observation = this.observation;
    }
  }

  updateObservation3(studentId: number, event: any) {
    if (event.target) {
      this.observation = event.target.value;
      const student = this.IDStudentsJustify.find(
        (student) => student.id === studentId,
      );

      if (student) {
        student.observation = this.observation;
      }
    }
  }

  // checkboxDeberiaEstarMarcado(id: number): boolean {
  //   if (this.IDStudents != null) {
  //     return this.IDStudents.includes(id);
  //   } else {
  //     return false;
  //   }
  // }

  // checkboxjustification(id: number): boolean {
  //   if (this.IDStudentsJustify != null && Array.isArray(this.IDStudentsJustify)) {
  //     return this.IDStudentsJustify.includes(id);
  //   } else {
  //     return false; // Devuelve false si this.IDStudentsJustify es null o no es un array
  //   }
  // }

  async eliminar_asistencia() {
    Swal.fire({
      title: 'Eliminar Registro',
      text: '¿Está seguro que desea eliminar el registro de asistencia? ',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const resp = await this.ApiService.delete_assistance(
          this.courseId,
          this.edit_date,
        );
        if (resp) {
          await Swal.fire({
            title: 'Eliminado',
            text:
              'Se ha eliminado un registro de asistencia del día:' +
              ' ' +
              this.edit_date +
              ' ' +
              this.name_level +
              '-' +
              this.name_course,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
          });
          this.router.navigate(['/teacher/mycourses']);
        }
      }
    });
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

  regresar(event: any) {
    console.log(event.target.name);
    localStorage.setItem('en', event.target.name);
    this.router.navigate(['/teacher/attendance/', event.target.name]);
  }

  getPlaceholder(isCheckboxChecked: boolean): string {
    return isCheckboxChecked ? 'Ingresar observación' : 'Ninguna observación';
  }
}

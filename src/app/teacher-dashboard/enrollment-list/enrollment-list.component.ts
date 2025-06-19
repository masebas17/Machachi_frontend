import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';
import {
  faArrowAltCircleLeft,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';
import { EnrollmentApprovalPayload } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-enrollment-list',
  templateUrl: './enrollment-list.component.html',
  styleUrls: ['./enrollment-list.component.css'],
})
export class EnrollmentListComponent implements OnInit {
  courseId: number = 0;
  name_level: string = '';
  name_course: string = '';
  enrollments: any[] = [];
  aprobados: Set<number> = new Set();
  faSave = faSave;
  faArrowAltCircleLeft = faArrowAltCircleLeft;
  bloqueado: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const courseId = params['id'];
      this.courseId = courseId;
      this.getEnrollmentList(courseId);
    });
  }

  async getEnrollmentList(courseId: any): Promise<void> {
    try {
      const resp = await this.apiService.getEnrollmentsByCourse(courseId);
      this.enrollments = resp.data;
      this.bloqueado = this.enrollments.some((e) => e.locked);

      this.aprobados.clear();
      this.enrollments.forEach((enrollment) => {
        if (enrollment.status === 'Aprobado') {
          this.aprobados.add(enrollment.id);
        }
      });

      this.name_level = this.enrollments[0]?.Course?.Level?.name || '';
      this.name_course = this.enrollments[0]?.Course?.name || '';
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    }
  }

  toggleAprobado(enrollmentId: number): void {
    if (this.aprobados.has(enrollmentId)) {
      this.aprobados.delete(enrollmentId);
      this.toastr.error('Se ha desmarcado un alumno');
    } else {
      this.aprobados.add(enrollmentId);
      this.toastr.success('Se ha marcado a un alumno como aprobado');
    }
  }

  guardarAprobaciones(): void {
    const payload: EnrollmentApprovalPayload = {
      approvedEnrollments: Array.from(this.aprobados),
      observations: 'Aprobación general',
    };

    this.apiService
      .updateEnrollmentsByCourse(this.courseId, payload)
      .subscribe({
        next: async () => {
          await this.getEnrollmentList(this.courseId);
          Swal.fire({
            icon: 'success',
            title: 'Se ha guardado la información con éxito',
            text: 'Las aprobaciones han sido registradas correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1D71B8',
          });
        },
      });
  }
}

import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-level-form-selection',
  templateUrl: './level-form-selection.component.html',
  styleUrls: ['./level-form-selection.component.css'],
})
export class LevelFormSelectionComponent implements OnInit {
  isMobile = false;
  faUser = faUser;
  shedules: any;
  levels: any;
  current_shedule;

  constructor(private router: Router, private _apiService: ApiService) {
    this.shedules = [];
    this.levels = {};
  }

  FormIdentitynumber = new FormGroup({
    identityNumber: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
  });

  ngOnInit(): void {
    this.checkIfMobile();
    // this.getShedule();
    //this.getSheduleVerify();
  }

  checkIfMobile() {
    if ((this.isMobile = window.innerWidth < 1024)) {
      Swal.fire({
        title: '¿Desea continuar?',
        text: 'Parece que estas usando un dispositivo móvil, es importante tener en cuenta que para realizar un proceso adecuado es mejor hacerlo desde un computador, si deseas continuar, puedes hacerlo bajo tu responsabilidad',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, deseo continuar',
        cancelButtonText: 'Salir',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.DismissReason.cancel;
        } else if (result.dismiss) {
          this.router.navigate(['/home']);
        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkIfMobile();
  }

  reset_Form() {
    this.FormIdentitynumber.reset();
  }

  // getSheduleVerify() {
  //   this._apiService.getShedule().subscribe((resp: any) => {
  //     console.log(resp), (this.shedules = resp.data);
  //   });
  // }

  // getShedule(){
  //   this._apiService.getShedulebyYear().subscribe((resp: any) => {
  //     console.log(resp),
  //     this.shedules = resp.data;
  //     console.log(this.shedules)
  //   })
  // }

  verifyActiveLevels() {
    this._apiService.getActiveEnrollmentLevels().subscribe({
      next: (resp: any) => {
        const niveles: any[] = resp.data || [];

        const nivelInicial = niveles.find((n) => n.order === 1);

        if (nivelInicial) {
          localStorage.setItem('nivel_habilitado', nivelInicial.id.toString());
          this.router.navigate(['/school-form-selection']);
        } else {
          // ⚠️ Se ejecuta si no hay nivel order === 1
          setTimeout(() => {
            Swal.fire({
              icon: 'warning',
              title: 'Matrícula no disponible',
              text: 'No están habilitados los días de matriculación para este nivel.',
              confirmButtonColor: '#1D71B8',
            });
          });
        }
      },
      error: () => {
        setTimeout(() => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo verificar la disponibilidad de matrícula',
            confirmButtonColor: '#1D71B8',
          });
        });
      },
    });
  }

  // verify_level() {
  //   this._apiService.getShedule().subscribe((resp: any) => {
  //     this.shedules = resp.data;

  //     // Debug: Verificar los datos de 'this.shedules'
  //     console.log('Horarios disponibles:', this.shedules);

  //     const idbusqueda = 13;

  //     // Debug: Asegurarse de que idbusqueda es un número
  //     console.log('Buscando horario con ID:', idbusqueda);

  //     // Verificar si existe un horario con id 13
  //     const auxshedule = this.shedules.find(
  //       (sheduleid) => sheduleid.id === idbusqueda
  //     );

  //     // Debug: Verificar el resultado de auxshedule
  //     console.log('Resultado de la búsqueda:', auxshedule);

  //     if (auxshedule !== undefined) {
  //       this.current_shedule = auxshedule;
  //       localStorage.setItem("cs", '13');
  //       this.router.navigate(['/course_selection', 13]);
  //     } else {
  //       Swal.fire({
  //         icon: 'error',
  //         text: 'Aún no inician los días de matriculación',
  //         confirmButtonColor: '#1D71B8'
  //       });
  //     }
  //   });
  // }

  consult_courses(event: any) {
    if (this.current_shedule.id === 19) {
      localStorage.setItem('cs', '19');
      this.router.navigate(['/course_selection', 19]);
    } else {
      Swal.fire({
        icon: 'error',
        text: 'No puede ingresar',
      });
    }
  }
}

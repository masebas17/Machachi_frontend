import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-school-form-selection',
  templateUrl: './school-form-selection.component.html',
  styleUrls: ['./school-form-selection.component.css'],
})
export class SchoolFormSelectionComponent implements OnInit {
  institutions: any[] = [];
  selectedInstitution: any = null;
  availableCourses: any[] = [];

  constructor(private router: Router, private _apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInstitutions();
  }

  // Obtener instituciones desde el servicio
  loadInstitutions() {
    this._apiService.getInstitutions().subscribe(
      (resp: any) => {
        this.institutions = resp.data; // <-- depende de tu backend, si manda "data"
        console.log('Instituciones cargadas:', this.institutions);
      },
      (error) => {
        console.error('Error al obtener instituciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las instituciones', 'error');
      }
    );
  }

  getAvailableCourses() {
    if (!this.selectedInstitution) {
      Swal.fire('Atención', 'Debes seleccionar una institución', 'warning');
      return;
    }

    const storedLevelOrder = localStorage.getItem('nivel_habilitado');

    if (!storedLevelOrder) {
      Swal.fire(
        'Error',
        'No se ha definido el nivel para la matriculación',
        'error'
      );
      return;
    }

    const levelOrder = parseInt(storedLevelOrder, 10);

    this._apiService
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

        localStorage.setItem('en', this.selectedInstitution.id);

        this.router.navigate(['/enrollment', this.selectedInstitution.id]);
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

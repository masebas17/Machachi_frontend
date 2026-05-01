import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  token: any = null;

  apiUrl = 'https://servicios.iglesiademachachi.com';
  //apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  //? Servicio que maneja el inicio de sesion
  async login(username: string, password: string) {
    const data = { username, password };
    const response: any = await this.http
      .post(`${this.apiUrl}/api/users/login`, data)
      .toPromise();
    //Guarda el token en el local storage al iniciar sesion correctamente
    if (response && response.correctProcess) {
      this.saveToken(response.data.token);
    } else {
      localStorage.removeItem('jwt');
    }
    return response;
  }

  //? Guarda el token en el local storage y tambien lo guarda en el atributo utilizado en el servicio
  saveToken(token: string) {
    this.token = token;
    localStorage.setItem('jwt', token);
  }

  //? Settea el atributo token utilizado en el servicio con el token guardado en el storage
  getToken() {
    this.token = localStorage.getItem('jwt') || null;
  }

  async verifyToken(): Promise<boolean> {
    this.getToken();
    // Si no existe un token en el storage, se redirecciona al login y se envia como una promesa con un false resolve
    if (!this.token) {
      this.router.navigate(['/login']);
      return Promise.resolve(false);
    } else {
      const role = localStorage.getItem('role');
      if (role === 'ADMIN') {
        return Promise.resolve(true);
      } else {
        this.router.navigate(['/login']);
        localStorage.removeItem('role');
        localStorage.removeItem('jwt');
        return Promise.resolve(false);
      }
    }
  }

  async verifyToken_supervisor(): Promise<boolean> {
    this.getToken();
    // Si no existe un token en el storage, se redirecciona al login y se envia como una promesa con un false resolve
    if (!this.token) {
      this.router.navigate(['/login']);
      return Promise.resolve(false);
    } else {
      const role = localStorage.getItem('role');
      if (role === 'SUPERVISOR') {
        return Promise.resolve(true);
      } else {
        this.router.navigate(['/login']);
        localStorage.removeItem('role');
        localStorage.removeItem('jwt');
        return Promise.resolve(false);
      }
    }
  }

  async login_teacher(username: string, password: string) {
    const data = { username, password };
    const response: any = await this.http
      .post(`${this.apiUrl}/api/users/login/teacher`, data)
      .toPromise();
    //Guarda el token en el local storage al iniciar sesion correctamente
    if (response && response.correctProcess) {
      this.saveToken(response.data.token);
    } else {
      localStorage.removeItem('jwt');
    }
    return response;
  }

  async verifyToken_teacher(): Promise<boolean> {
    this.getToken();
    // Si no existe un token en el storage, se redirecciona al login y se envia como una promesa con un false resolve
    if (!this.token) {
      this.router.navigate(['/teacher-login']);
      return Promise.resolve(false);
    } else {
      const role = localStorage.getItem('role');
      if (role === 'TEACHER') {
        return Promise.resolve(true);
      } else {
        this.router.navigate(['/teacher-login']);
        localStorage.removeItem('role');
        localStorage.removeItem('jwt');
        return Promise.resolve(false);
      }
    }
  }
}

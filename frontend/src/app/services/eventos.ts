import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  obtenerEventos() {
    return this.http.get(`${this.apiUrl}/eventos/`);
  }

  login(datos: any) {
    return this.http.post(`${this.apiUrl}/auth/login/`, datos);
  }

  register(datos: any) {
    return this.http.post(`${this.apiUrl}/auth/register/`, datos);
  }

}
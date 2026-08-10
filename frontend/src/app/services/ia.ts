import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventoIA {
  id: string;
  titulo: string;
  ubicacion: string;
  fecha: string;
  hora?: string;
  categoria: string;
  descripcion: string;
  creador: string;
}

export interface RespuestaIA {
  respuesta: string;
  consulta: string;
  cantidad_eventos: number;
  categoria_detectada: string | null;
  eventos: EventoIA[];
}

@Injectable({
  providedIn: 'root'
})
export class IaService {

  private apiUrl = 'http://127.0.0.1:8000/api/ia-recomendar/';

  constructor(
    private http: HttpClient
  ) {}

  recomendarEventos(
    mensaje: string
  ): Observable<RespuestaIA> {

    return this.http.post<RespuestaIA>(
      this.apiUrl,
      {
        mensaje: mensaje
      }
    );

  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

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
  eventos: EventoIA[];
}

@Injectable({
  providedIn: 'root'
})
export class IaService {

  private apiUrl = `${environment.apiUrl}/ia-recomendar/`;

  constructor(
    private http: HttpClient
  ) {}

  recomendarEventos(
    mensaje: string
  ): Observable<RespuestaIA> {

    return this.http
      .post<any>(
        this.apiUrl,
        {
          mensaje: mensaje.trim()
        }
      )
      .pipe(
        map((res) => {

          console.log('📥 Respuesta recibida en IaService:', res);

          if (!res) {
            throw new Error('La respuesta del servidor está vacía');
          }

          return {
            respuesta: res.respuesta || '',
            consulta: res.consulta || mensaje,
            cantidad_eventos: res.cantidad_eventos || 0,
            eventos: Array.isArray(res.eventos)
              ? res.eventos
              : []
          };

        })
      );
  }
}
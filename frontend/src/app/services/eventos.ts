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

  crearEvento(evento: any) {
    return this.http.post(
      `${this.apiUrl}/eventos/`,
      evento
    );
  }

  eliminarEvento(id: string) {
    return this.http.delete(
      `${this.apiUrl}/eventos/${id}/`
    );
  }

  actualizarEvento(id: string, evento: any) {
    return this.http.put(
      `${this.apiUrl}/eventos/${id}/`,
      evento
    );
  }

  subirImagen(formData: FormData) {
    return this.http.post(
      `${this.apiUrl}/upload-image/`,
      formData
    );
  }

  toggleLike(eventoId: string, uid: string) {

    return this.http.post(

      `${this.apiUrl}/eventos/${eventoId}/like/`,

      {
        uid: uid
      }

    );

  }
  toggleFavorito(eventoId: string, uid: string) {

    return this.http.post(

      `${this.apiUrl}/eventos/${eventoId}/favorito/`,

      {
        uid
      }

    );

  }
}
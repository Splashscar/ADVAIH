import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IaService, EventoIA } from '../../services/ia';
import { RouterLink } from '@angular/router';

import { FooterComponent } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';

interface MensajeChat {
  id: number;
  tipo: 'usuario' | 'ia';
  contenido: string;
  eventos?: EventoIA[];
  fecha: string;
}

@Component({
  selector: 'app-ia',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FooterComponent,
    Navbar
  ],

  templateUrl: './ia.html',
  styleUrl: './ia.css'
})
export class Ia implements OnInit {

  // =========================================================
  // MENSAJE ACTUAL
  // =========================================================

  mensaje = '';

  cargando = false;

  // =========================================================
  // HISTORIAL DEL CHAT
  // =========================================================

  mensajesChat: MensajeChat[] = [];

  // =========================================================
  // USUARIO
  // =========================================================

  uidUsuario = '';

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private iaService: IaService,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {

    this.authService.usuario$.subscribe({

      next: (usuario) => {

        if (!usuario) {

          console.warn(
            '⚠️ No hay usuario autenticado'
          );

          this.uidUsuario = 'usuario-invitado';

          this.cargarHistorial();

          return;
        }

        this.uidUsuario = usuario.uid;

        console.log(
          '👤 Usuario IA:',
          this.uidUsuario
        );

        this.cargarHistorial();

      },

      error: (error) => {

        console.error(
          '❌ Error obteniendo usuario:',
          error
        );

        this.uidUsuario = 'usuario-invitado';

        this.cargarHistorial();

      }

    });

  }

  // =========================================================
  // KEY DEL HISTORIAL
  // =========================================================

  private obtenerClaveHistorial(): string {

    return `advaih_ia_historial_${this.uidUsuario}`;

  }

  // =========================================================
  // CARGAR HISTORIAL
  // =========================================================

  cargarHistorial(): void {

    try {

      const historial =
        localStorage.getItem(
          this.obtenerClaveHistorial()
        );

      if (historial) {

        this.mensajesChat =
          JSON.parse(historial);

        console.log(
          '💾 Historial IA cargado:',
          this.mensajesChat
        );

      } else {

        this.mensajesChat = [];

      }

      this.cdr.detectChanges();

    } catch (error) {

      console.error(
        '❌ Error cargando historial IA:',
        error
      );

      this.mensajesChat = [];

    }

  }

  // =========================================================
  // GUARDAR HISTORIAL
  // =========================================================

  private guardarHistorial(): void {

    try {

      localStorage.setItem(

        this.obtenerClaveHistorial(),

        JSON.stringify(
          this.mensajesChat
        )

      );

    } catch (error) {

      console.error(
        '❌ Error guardando historial IA:',
        error
      );

    }

  }

  // =========================================================
  // ENVIAR MENSAJE
  // =========================================================

  enviarMensaje(): void {

    const texto =
      this.mensaje.trim();

    if (!texto || this.cargando) {
      return;
    }

    // =======================================================
    // GUARDAR MENSAJE DEL USUARIO
    // =======================================================

    const mensajeUsuario: MensajeChat = {

      id: Date.now(),

      tipo: 'usuario',

      contenido: texto,

      fecha:
        new Date().toISOString()

    };

    this.mensajesChat.push(
      mensajeUsuario
    );

    // Limpiar input inmediatamente
    this.mensaje = '';

    this.cargando = true;

    this.guardarHistorial();

    this.cdr.detectChanges();

    // =======================================================
    // LLAMAR A DJANGO / GEMINI
    // =======================================================

    console.log(
      '📤 Enviando a IA:',
      texto
    );

    this.iaService
      .recomendarEventos(texto)
      .subscribe({

        next: (res) => {

          console.log(
            '🤖 Respuesta de Django:',
            res
          );

          console.log(
            '📦 Eventos recibidos:',
            res.eventos
          );

          // =================================================
          // CREAR RESPUESTA DE LA IA
          // =================================================

          const mensajeIA: MensajeChat = {

            id: Date.now() + 1,

            tipo: 'ia',

            contenido:
              res.respuesta ||
              'No pude generar una respuesta.',

            eventos:
              res.eventos || [],

            fecha:
              new Date().toISOString()

          };

          // =================================================
          // AGREGAR AL CHAT
          // =================================================

          this.mensajesChat.push(
            mensajeIA
          );

          this.cargando = false;

          // =================================================
          // GUARDAR
          // =================================================

          this.guardarHistorial();

          // =================================================
          // ACTUALIZAR VISTA
          // =================================================

          this.cdr.detectChanges();

          console.log(
            '💬 Historial actualizado:',
            this.mensajesChat
          );

        },

        error: (err) => {

          console.error(
            '❌ Error llamando a la IA:',
            err
          );

          const mensajeError: MensajeChat = {

            id: Date.now() + 1,

            tipo: 'ia',

            contenido:
              '❌ Ocurrió un error al comunicarse con ADVAIH IA. Intenta nuevamente.',

            eventos: [],

            fecha:
              new Date().toISOString()

          };

          this.mensajesChat.push(
            mensajeError
          );

          this.cargando = false;

          this.guardarHistorial();

          this.cdr.detectChanges();

        }

      });

  }

  // =========================================================
  // LIMPIAR CHAT
  // =========================================================

  limpiarChat(): void {

    const confirmar =
      confirm(
        '¿Quieres borrar todo el historial de ADVAIH IA?'
      );

    if (!confirmar) {
      return;
    }

    this.mensajesChat = [];

    localStorage.removeItem(
      this.obtenerClaveHistorial()
    );

    this.cdr.detectChanges();

    console.log(
      '🗑️ Historial IA eliminado'
    );

  }

}
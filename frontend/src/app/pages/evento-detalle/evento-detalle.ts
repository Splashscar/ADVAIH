import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

import { FooterComponent } from '../../components/footer/footer';
import { EventosService } from '../../services/eventos';
import { AsistentesService } from '../../services/asistentes';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './evento-detalle.html',
  styleUrl: './evento-detalle.css'
})
export class EventoDetalleComponent implements OnInit {

  evento: any = null;

  error = false;

  cantidadAsistentes = 0;

  estaAsistiendo = false;

  procesandoAsistencia = false;

  asistentes: any[] = [];

  esCreador = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private asistentesService: AsistentesService,
    private auth: Auth
  ) { }


  ngOnInit(): void {

    // ========================================
    // 1. INTENTAR RECIBIR EL EVENTO DESDE HOME
    // ========================================

    const eventoRecibido = history.state?.evento;

    console.log(
      '📦 Evento recibido desde Home:',
      eventoRecibido
    );


    if (eventoRecibido) {

      this.evento = eventoRecibido;

      console.log(
        '⚡ Evento mostrado directamente desde Home'
      );

      console.log(
        '🔎 OBJETO COMPLETO DEL EVENTO:',
        JSON.stringify(this.evento, null, 2)
      );

      this.cargarAsistencia();

      return;
    }


    // ========================================
    // 2. SI NO VIENE DE HOME, BUSCAR POR ID
    // ========================================

    const id = this.route.snapshot.paramMap.get('id');

    console.log(
      '🔎 Buscando evento por ID:',
      id
    );


    if (!id) {

      console.error(
        '❌ No se recibió el ID del evento'
      );

      this.error = true;

      return;
    }


    // ========================================
    // 3. CONSULTA DE RESPALDO
    // ========================================

    this.eventosService.obtenerEvento(id).subscribe({

      next: (evento: any) => {

        console.log(
          '📦 Evento cargado desde backend:',
          evento
        );


        if (!evento) {

          this.error = true;

          return;
        }


        this.evento = evento;

        // Cargar asistencia y contador
        this.cargarAsistencia();

      },


      error: (error) => {

        console.error(
          '❌ Error cargando evento:',
          error
        );

        this.error = true;

      }

    });

  }


  // ========================================
  // CARGAR ASISTENCIA
  // ========================================

  private cargarAsistencia(): void {



    if (!this.evento?.id) {

      console.warn(
        '⚠️ No se puede cargar asistencia: evento sin ID'
      );

      return;
    }


    console.log(
      '👥 Cargando asistentes del evento:',
      this.evento.id
    );
    const usuario = this.auth.currentUser;

    this.esCreador =
      !!usuario &&
      usuario.uid === this.evento.authorId;

    console.log(
      '👑 ¿Es creador?:',
      this.esCreador
    );
    if (this.esCreador) {
      this.cargarListaAsistentes();
    }


    // ========================================
    // CONTADOR
    // ========================================

    this.asistentesService
      .obtenerCantidad(this.evento.id)
      .subscribe({

        next: (cantidad) => {

          console.log(
            '🔢 Cantidad de asistentes:',
            cantidad
          );

          this.cantidadAsistentes = cantidad;

        },

        error: (error) => {

          console.error(
            '❌ Error obteniendo asistentes:',
            error
          );

        }

      });


    // ========================================
    // ESTADO DEL USUARIO
    // ========================================

    this.asistentesService
      .estaAsistiendo(this.evento.id)
      .subscribe({

        next: (asistiendo) => {

          console.log(
            '🎟️ ¿Usuario está asistiendo?:',
            asistiendo
          );

          this.estaAsistiendo = asistiendo;

        },

        error: (error) => {

          console.error(
            '❌ Error comprobando asistencia:',
            error
          );

        }

      });

  }

  // ========================================
  // CARGAR LISTA DE ASISTENTES
  // ========================================

  private cargarListaAsistentes(): void {

    if (!this.evento?.id) {

      return;

    }

    console.log(
      '👥 Cargando lista de asistentes:',
      this.evento.id
    );


    this.asistentesService
      .obtenerAsistentes(this.evento.id)
      .subscribe({

        next: (asistentes) => {

          console.log(
            '👥 Lista de asistentes:',
            asistentes
          );

          this.asistentes = asistentes;

        },

        error: (error) => {

          console.error(
            '❌ Error cargando lista de asistentes:',
            error
          );

        }

      });

  }


  // ========================================
  // TOGGLE ASISTENCIA
  // ========================================

  async toggleAsistencia(): Promise<void> {

    if (!this.evento?.id) {

      return;
    }


    if (this.procesandoAsistencia) {

      return;
    }


    this.procesandoAsistencia = true;


    try {

      // ====================================
      // CANCELAR ASISTENCIA
      // ====================================

      if (this.estaAsistiendo) {

        await this.asistentesService
          .cancelarAsistencia(this.evento.id);


        this.estaAsistiendo = false;

        console.log(
          '❌ Asistencia cancelada'
        );

      }


      // ====================================
      // REGISTRAR ASISTENCIA
      // ====================================

      // ====================================
      // REGISTRAR ASISTENCIA
      // ====================================

      else {

        await this.asistentesService.asistir(
          this.evento.id,
          this.evento.authorId,
          this.evento.title
        );

        this.estaAsistiendo = true;

        console.log(
          '✅ Asistencia registrada'
        );

      }


      // ====================================
      // ACTUALIZAR CONTADOR REAL
      // ====================================

      this.asistentesService
        .obtenerCantidad(this.evento.id)
        .subscribe({

          next: (cantidad) => {

            console.log(
              '🔄 Contador actualizado:',
              cantidad
            );

            this.cantidadAsistentes = cantidad;

          },

          error: (error) => {

            console.error(
              '❌ Error actualizando contador:',
              error
            );

          }

        });

    }


    catch (error) {

      console.error(
        '❌ Error cambiando asistencia:',
        error
      );

    }


    finally {

      this.procesandoAsistencia = false;

    }

  }


  // ========================================
  // VOLVER
  // ========================================

  volver(): void {

    this.router.navigate(['/home']);

  }
  // ========================================
// ABRIR UBICACIÓN EN GOOGLE MAPS
// ========================================

abrirGoogleMaps(): void {

  if (!this.evento?.location) {
    return;
  }

  const url =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(this.evento.location);

  window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  );
}

  // ========================================
  // OPTIMIZAR IMAGEN DE CLOUDINARY
  // ========================================

  imagenOptimizada(url: string): string {

    if (!url) {

      return '';

    }


    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_1000/'
    );

  }

}
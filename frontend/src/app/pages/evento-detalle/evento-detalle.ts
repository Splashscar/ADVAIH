import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Navbar } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { EventosService } from '../../services/eventos';
import { AsistentesService } from '../../services/asistentes';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FooterComponent,
    Navbar
  ],
  templateUrl: './evento-detalle.html',
  styleUrl: './evento-detalle.css'
})
export class EventoDetalleComponent implements OnInit, OnDestroy {

  evento: any = null;

  error = false;

  cantidadAsistentes = 0;

  estaAsistiendo = false;

  asistentesCargados = false;

  procesandoAsistencia = false;

  asistentes: any[] = [];

  esCreador = false;

  private asistenciaSubscription?: Subscription;

  private estadoAsistenciaSubscription?: Subscription;

  private eventoSubscription?: Subscription;

  // =========================================================
  // NUEVO: ACTUALIZACIÓN AUTOMÁTICA DE ASISTENTES
  // =========================================================

  private asistentesRefreshSubscription?: Subscription;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private asistentesService: AsistentesService,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) { }


  // =========================================================
  // INICIO
  // =========================================================

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
    // 2. BUSCAR EVENTO POR ID
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
    // 3. CARGAR EVENTO
    // ========================================

    this.eventoSubscription =
      this.eventosService.obtenerEvento(id).subscribe({

        next: (evento: any) => {

          console.log(
            '📦 Evento cargado desde Firestore:',
            evento
          );


          if (!evento) {

            this.error = true;

            return;
          }


          this.evento = evento;

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
      '🚀 CARGANDO ASISTENCIA DESDE FIRESTORE:',
      this.evento.id
    );


    // =====================================================
    // ESCUCHAR LA CANTIDAD DE ASISTENTES
    // =====================================================

    this.asistenciaSubscription =
      this.asistentesService
        .obtenerCantidad(this.evento.id)
        .subscribe({

          next: (cantidad) => {

            console.log(
              '🔥 CANTIDAD RECIBIDA DESDE FIRESTORE:',
              cantidad
            );

            this.cantidadAsistentes = cantidad;

            console.log(
              '🟢 VARIABLE DEL COMPONENTE:',
              this.cantidadAsistentes
            );

            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              '❌ Error obteniendo cantidad:',
              error
            );

          }

        });


    // =====================================================
    // SABER SI EL USUARIO ASISTE
    // =====================================================

    this.estadoAsistenciaSubscription =
      this.asistentesService
        .estaAsistiendo(this.evento.id)
        .subscribe({

          next: (asistiendo) => {

            console.log(
              '🎟️ ¿Usuario está asistiendo?:',
              asistiendo
            );

            this.estaAsistiendo = asistiendo;

            this.cdr.detectChanges();

          },

          error: (error) => {

            console.error(
              '❌ Error comprobando asistencia:',
              error
            );

          }

        });


    // =====================================================
    // SABER SI ES EL CREADOR
    // =====================================================

    const usuario = this.auth.currentUser;

    this.esCreador =
      !!usuario &&
      usuario.uid === this.evento.authorId;


    console.log(
      '👑 ¿Es creador?:',
      this.esCreador
    );


    // =====================================================
    // CARGAR LISTA SI ES CREADOR
    // =====================================================

    if (this.esCreador) {

      // Carga inicial
      this.cargarListaAsistentes();

      // ===================================================
      // NUEVO:
      // ACTUALIZAR AUTOMÁTICAMENTE CADA 3 SEGUNDOS
      // ===================================================

      this.asistentesRefreshSubscription =
        interval(3000).subscribe(() => {

          // Seguridad:
          // solamente actualizamos si sigue siendo
          // el creador y existe el evento.

          if (
            this.esCreador &&
            this.evento?.id
          ) {

            console.log(
              '🔄 Actualizando automáticamente asistentes...'
            );

            this.cargarListaAsistentes();

          }

        });

    }

  }


  // =========================================================
  // CARGAR LISTA DE ASISTENTES
  // =========================================================

  private cargarListaAsistentes(): void {

    if (!this.evento?.id) {
      return;
    }

    console.log(
      '👥 Cargando lista de asistentes:',
      this.evento.id
    );

    this.asistentesCargados = false;

    this.asistentesService
      .obtenerAsistentes(this.evento.id)
      .subscribe({

        next: (asistentes) => {

          console.log(
            '🔥 ASISTENTES RECIBIDOS:',
            asistentes
          );

          this.asistentes = asistentes || [];

          console.log(
            '🟢 ASISTENTES EN COMPONENTE:',
            this.asistentes
          );

          this.asistentesCargados = true;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            '❌ Error cargando asistentes:',
            error
          );

          this.asistentes = [];

          this.asistentesCargados = true;

          this.cdr.detectChanges();

        }

      });

  }


  // =========================================================
  // TOGGLE ASISTENCIA
  // =========================================================

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
          .cancelarAsistencia(
            this.evento.id
          );


        this.estaAsistiendo = false;


        console.log(
          '❌ Asistencia cancelada'
        );

      }


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


  // =========================================================
  // VOLVER
  // =========================================================

  volver(): void {

    this.router.navigate([
      '/home'
    ]);

  }


  // =========================================================
  // GOOGLE MAPS
  // =========================================================

  abrirGoogleMaps(): void {

    if (!this.evento?.location) {

      return;

    }


    const url =
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(
        this.evento.location
      );


    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );

  }


  // =========================================================
  // OPTIMIZAR IMAGEN DE CLOUDINARY
  // =========================================================

  imagenOptimizada(url: string): string {

    if (!url) {

      return '';

    }


    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_1000/'
    );

  }


  // =========================================================
  // DESTRUIR COMPONENTE
  // =========================================================

  ngOnDestroy(): void {

    this.asistenciaSubscription?.unsubscribe();

    this.estadoAsistenciaSubscription?.unsubscribe();

    this.eventoSubscription?.unsubscribe();

    // =====================================================
    // NUEVO:
    // DETENER LA ACTUALIZACIÓN AUTOMÁTICA AL SALIR
    // =====================================================

    this.asistentesRefreshSubscription?.unsubscribe();

  }

}
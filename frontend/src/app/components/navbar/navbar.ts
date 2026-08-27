import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { FirebaseService } from '../../services/firebase';
import { AuthServices } from '../../services/auth';
import { RoleService } from '../../services/role';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  nombreUsuario = '';

  notificaciones: any[] = [];

  noLeidas = 0;

  mostrarNotificaciones = false;

  usuarioActual: any = null;


  constructor(
    private authService: AuthServices,
    public roleService: RoleService,
    private router: Router,
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================================================
  // INICIALIZAR
  // =========================================================

  ngOnInit(): void {

    this.authService.usuario$
      .subscribe(usuario => {

        this.usuarioActual = usuario;


        // =====================================================
        // NO HAY USUARIO
        // =====================================================

        if (!usuario) {

          this.notificaciones = [];

          this.noLeidas = 0;

          return;

        }


        // =====================================================
        // NOMBRE DEL USUARIO
        // =====================================================

        this.nombreUsuario =
          usuario.displayName ||
          usuario.email ||
          'Usuario';


        // =====================================================
        // OBTENER NOTIFICACIONES
        // =====================================================

        this.firebaseService
          .obtenerNotificaciones(usuario.uid)
          .subscribe({

            next: (notificaciones: any[]) => {

              console.log(
                '🔔 Notificaciones recibidas:',
                notificaciones
              );


              this.notificaciones =
                notificaciones;


              // =================================================
              // CONTAR NO LEÍDAS
              // =================================================

              this.noLeidas =
                notificaciones.filter(
                  n => !n.leida
                ).length;


              this.cdr.detectChanges();

            },


            error: (error) => {

              console.error(
                '❌ Error cargando notificaciones:',
                error
              );

            }

          });

      });

  }


  // =========================================================
  // MOSTRAR / OCULTAR NOTIFICACIONES
  // =========================================================

  toggleNotificaciones(): void {

    this.mostrarNotificaciones =
      !this.mostrarNotificaciones;

  }


  // =========================================================
  // ABRIR NOTIFICACIÓN
  // =========================================================

  async abrirNotificacion(
    notificacion: any
  ): Promise<void> {

    if (!notificacion) {

      return;

    }


    // =======================================================
    // MARCAR COMO LEÍDA
    // =======================================================

    if (
      !notificacion.leida &&
      this.usuarioActual
    ) {

      try {

        await this.firebaseService
          .marcarNotificacionLeida(
            this.usuarioActual.uid,
            notificacion.id
          );


        console.log(
          '✅ Notificación marcada como leída'
        );

      } catch (error) {

        console.error(
          '❌ Error marcando notificación:',
          error
        );

        return;

      }

    }


    // =======================================================
    // CERRAR MENÚ
    // =======================================================

    this.mostrarNotificaciones = false;


    // =======================================================
    // ABRIR CHAT
    // =======================================================

    if (
      notificacion.tipo === 'mensaje' &&
      notificacion.chatId
    ) {

      console.log(
        '💬 Abriendo chat:',
        notificacion.chatId
      );


      this.router.navigate([
        '/chats',
        notificacion.chatId
      ]);

      return;

    }


    // =======================================================
    // ABRIR EVENTO
    // =======================================================

    if (
      notificacion.tipo === 'asistencia' &&
      notificacion.eventoId
    ) {

      console.log(
        '🎟️ Abriendo evento:',
        notificacion.eventoId
      );


      this.router.navigate([
        '/evento',
        notificacion.eventoId
      ]);

      return;

    }

  }


  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  async cerrarSesion(): Promise<void> {

    try {

      await this.authService.cerrarSesion();

      this.router.navigate(['/']);

    } catch (error) {

      console.error(
        '❌ Error cerrando sesión:',
        error
      );

    }

  }

}

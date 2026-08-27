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


   ngOnInit(): void {

  this.authService.usuario$
    .subscribe(usuario => {

      this.usuarioActual = usuario;

      if (!usuario) {
        return;
      }

      this.nombreUsuario =
        usuario.displayName ||
        usuario.email ||
        'Usuario';

      this.firebaseService
        .obtenerNotificaciones(usuario.uid)
        .subscribe({

          next: (notificaciones: any[]) => {

            this.notificaciones =
              notificaciones;

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
toggleNotificaciones(): void {

  this.mostrarNotificaciones =
    !this.mostrarNotificaciones;

}
async abrirNotificacion(notificacion: any) {

  if (!notificacion) {
    return;
  }

  // =========================
  // MARCAR COMO LEÍDA
  // =========================

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

    } catch (error) {

      console.error(
        '❌ Error marcando notificación:',
        error
      );

      return;
    }

  }


  // =========================
  // CERRAR MENÚ
  // =========================

  this.mostrarNotificaciones = false;


  // =========================
  // ABRIR CHAT
  // =========================

  if (
    notificacion.tipo === 'mensaje' &&
    notificacion.chatId
  ) {

    this.router.navigate([
      '/chats',
      notificacion.chatId
    ]);

  }

}


    async cerrarSesion() {

      try {

        await this.authService.cerrarSesion();

        this.router.navigate(['/']);

      } catch (error) {

        console.error(error);

      }

    }
    

  }
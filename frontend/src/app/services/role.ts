import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { doc, docData, Firestore } from '@angular/fire/firestore';
import { AuthServices } from './auth';

export type RolUsuario = 'usuario' | 'organizador' | 'administrador';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private firestore = inject(Firestore);

  private rolSubject =
    new BehaviorSubject<RolUsuario>('usuario');

  rol$ = this.rolSubject.asObservable();

  constructor(
    private authService: AuthServices
  ) {

    console.log('🟢 ROLE SERVICE INICIADO');

    this.authService.usuario$.subscribe({

      next: (usuario) => {

        console.log('👤 USUARIO AUTH:', usuario);

        if (!usuario) {

          console.log('⚠️ No hay usuario autenticado');

          this.rolSubject.next('usuario');

          return;

        }

        console.log(
          '🆔 UID PARA BUSCAR EN FIRESTORE:',
          usuario.uid
        );

        this.cargarRol(usuario.uid);

      },

      error: (error) => {

        console.error(
          '❌ ERROR AUTH EN ROLES:',
          error
        );

      }

    });

  }

  private cargarRol(uid: string): void {

    console.log(
      '🔥 BUSCANDO DOCUMENTO:',
      `usuarios/${uid}`
    );

    const usuarioRef =
      doc(this.firestore, `usuarios/${uid}`);

    docData(usuarioRef).subscribe({

      next: (datos: any) => {

        console.log(
          '📄 DATOS FIRESTORE DEL USUARIO:',
          datos
        );

        if (!datos) {

          console.warn(
            '⚠️ NO EXISTE EL DOCUMENTO DEL USUARIO'
          );

          this.rolSubject.next('usuario');

          return;

        }

        console.log(
          '🎭 tipo_usuario EN FIRESTORE:',
          datos.tipo_usuario
        );

        const rol =
          datos.tipo_usuario || 'usuario';

        const rolNormalizado =
          this.normalizarRol(rol);

        console.log(
          '🛡️ ROL FINAL:',
          rolNormalizado
        );

        this.rolSubject.next(
          rolNormalizado
        );

      },

      error: (error) => {

        console.error(
          '❌ ERROR LEYENDO FIRESTORE:',
          error
        );

      }

    });

  }

  private normalizarRol(
    rol: string
  ): RolUsuario {

    const rolNormalizado =
      rol.toLowerCase().trim();

    if (rolNormalizado === 'organizador') {
      return 'organizador';
    }

    if (
      rolNormalizado === 'administrador' ||
      rolNormalizado === 'admin'
    ) {
      return 'administrador';
    }

    return 'usuario';

  }

  obtenerRol(): RolUsuario {

    return this.rolSubject.value;

  }

  esUsuario(): boolean {

    return this.obtenerRol() === 'usuario';

  }

  esOrganizador(): boolean {

    return this.obtenerRol() === 'organizador';

  }

  esAdministrador(): boolean {

    return this.obtenerRol() === 'administrador';

  }

}
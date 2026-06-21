import { inject, Injectable } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { map } from 'rxjs';
import { Usuario } from '../models/usuario';
import { getRedirectResult } from 'firebase/auth';

import {
  GoogleAuthProvider,
  signOut,
  signInWithPopup
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {

  private auth = inject(Auth);

  usuario$ = user(this.auth);

  estaAutenticado$ = this.usuario$.pipe(
    map(usuario => !!usuario)
  );

  async loginGoogle(): Promise<Usuario | null> {

    try {

      const proveedor = new GoogleAuthProvider();

      proveedor.addScope('email');
      proveedor.addScope('profile');

      const resultado = await signInWithPopup(
        this.auth,
        proveedor
      );

      const usuarioFirebase = resultado.user;

      if (!usuarioFirebase) return null;

      return {
        uid: usuarioFirebase.uid,
        nombre: usuarioFirebase.displayName || 'usuario sin nombre',
        email: usuarioFirebase.email || '',
        fotoURL: usuarioFirebase.photoURL ?? '',
        FechaCreacion: new Date(),
        ultimaconexion: new Date()
      };

    } catch (error) {

      console.error("ERROR LOGIN:", error);
      throw error;

    }

  }
  obtenerUsuario(): User | null {
    return this.auth.currentUser;
  }

  async cerrarSesion(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw error;
    }
  }

  async procesarRedirect() {
    try {

      const resultado = await getRedirectResult(this.auth);

      console.log("REDIRECT RESULT:", resultado);

      if (resultado?.user) {
        console.log("USUARIO:", resultado.user);
      }

    } catch (error) {

      console.error("ERROR REDIRECT:", error);

    }
  }
}
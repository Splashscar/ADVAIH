import { inject, Injectable } from '@angular/core';
import { Auth, user, User, authState } from '@angular/fire/auth';
import { map } from 'rxjs';
import { Usuario } from '../models/usuario';
import { getRedirectResult, } from 'firebase/auth';

import {
  GoogleAuthProvider,
  signOut,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {

  private auth = inject(Auth);

  usuario$ = authState(this.auth);


  estaAutenticado$ = this.usuario$.pipe(
    map(usuario => !!usuario)
  );

  // =========================
  // LOGIN CON GOOGLE
  // =========================
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

      console.error("ERROR LOGIN GOOGLE:", error);
      throw error;

    }

  }

  // =========================
  // REGISTRO CON EMAIL
  // =========================
  async registrarConEmail(
    nombre: string,
    email: string,
    password: string
  ): Promise<Usuario | null> {

    try {

      const resultado =
        await createUserWithEmailAndPassword(
          this.auth,
          email,
          password
        );

      await updateProfile(
        resultado.user,
        {
          displayName: nombre
        }
      );

      return {
        uid: resultado.user.uid,
        nombre: nombre,
        email: resultado.user.email || '',
        fotoURL: '',
        FechaCreacion: new Date(),
        ultimaconexion: new Date()
      };

    } catch (error) {

      console.error("ERROR REGISTRO:", error);
      throw error;

    }

  }

  // =========================
  // LOGIN CON EMAIL
  // =========================
  async loginConEmail(
    email: string,
    password: string
  ): Promise<Usuario | null> {

    try {

      const resultado =
        await signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );

      const usuarioFirebase = resultado.user;

      return {
        uid: usuarioFirebase.uid,
        nombre: usuarioFirebase.displayName || '',
        email: usuarioFirebase.email || '',
        fotoURL: usuarioFirebase.photoURL || '',
        FechaCreacion: new Date(),
        ultimaconexion: new Date()
      };

    } catch (error) {

      console.error("ERROR LOGIN EMAIL:", error);
      throw error;

    }

  }

  // =========================
  // UTILIDADES
  // =========================
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

      const resultado =
        await getRedirectResult(this.auth);

      console.log(
        "REDIRECT RESULT:",
        resultado
      );

      if (resultado?.user) {

        console.log(
          "USUARIO:",
          resultado.user
        );

      }

    } catch (error) {

      console.error(
        "ERROR REDIRECT:",
        error
      );

    }

  }
 
}
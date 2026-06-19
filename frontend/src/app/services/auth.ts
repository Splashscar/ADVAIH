import { inject, Injectable } from '@angular/core';
import { Auth, user, User } from '@angular/fire/auth';
import { map } from 'rxjs';
import { Usuario } from '../models/usuario';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private auth = inject(Auth);

  // 👤 usuario actual en tiempo real
  usuario$ = user(this.auth);

  // 🔐 estado de autenticación (true/false)
  estaAutenticado$ = this.usuario$.pipe(
    map(usuario => !!usuario)
  );

  // 🔥 LOGIN CON GOOGLE
  async loginGoogle(): Promise<Usuario | null> {
    try {
      const proveedor = new GoogleAuthProvider();

      proveedor.addScope('email');
      proveedor.addScope('profile');

      const resultado = await signInWithPopup(this.auth, proveedor);
      const usuarioFirebase = resultado.user;

      if (!usuarioFirebase) return null;

      const usuario: Usuario = {
        uid: usuarioFirebase.uid,
        nombre: usuarioFirebase.displayName || 'usuario sin nombre',
        email: usuarioFirebase.email || '',
        fotoURL: usuarioFirebase.photoURL ?? '',
        FechaCreacion: new Date(),
        ultimaconexion: new Date()
      };

      return usuario;

    } catch (error) {
      console.error('❌ Error en autenticación con Google:', error);
      throw error;
    }
  }

  // 👤 obtener usuario actual
  obtenerUsuario(): User | null {
    return this.auth.currentUser;
  }

  // 🚪 cerrar sesión
  async cerrarSesion(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      throw error;
    }
  }
}
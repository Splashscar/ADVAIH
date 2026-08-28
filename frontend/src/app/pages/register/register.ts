import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthServices } from '../../services/auth';
import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    RouterLink,
    FormsModule
  ],

  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  nombre = '';
  email = '';
  password = '';
  confirmarPassword = '';

  tipo_usuario: 'usuario' | 'colaborador' = 'usuario';

  descripcion = '';

  mostrarPassword = false;
  mostrarConfirmarPassword = false;

  constructor(
    private authService: AuthServices,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async registrar() {

    try {

      // =========================
      // VALIDACIONES
      // =========================

      if (
        !this.nombre.trim() ||
        !this.email.trim() ||
        !this.password ||
        !this.confirmarPassword
      ) {

        alert('Completa todos los campos');
        return;

      }

      if (this.password !== this.confirmarPassword) {

        alert('Las contraseñas no coinciden');
        return;

      }

      if (this.password.length < 6) {

        alert('La contraseña debe tener mínimo 6 caracteres');
        return;

      }

      // =========================
      // REGISTRAR EN FIREBASE AUTH
      // =========================

      const usuario =
        await this.authService.registrarConEmail(
          this.nombre,
          this.email,
          this.password
        );

      if (!usuario) {
        return;
      }

      console.log('👤 Usuario registrado:', usuario);

      // =========================
      // GUARDAR EN FIRESTORE
      // =========================

      const usuarioFirestore = {

        ...usuario,

        tipo_usuario: this.tipo_usuario,

        descripcion:
          this.tipo_usuario === 'colaborador'
            ? this.descripcion.trim()
            : ''

      };

      console.log(
        '🔥 Usuario que se guardará:',
        usuarioFirestore
      );

      await this.firebaseService.guardarUsuario(
        usuarioFirestore
      );

      // =========================
      // ÉXITO
      // =========================

      alert('Usuario registrado correctamente');

      await this.router.navigate(['/home']);

    } catch (error: any) {

      console.error(
        '❌ Error al registrar:',
        error
      );

      if (error?.code === 'auth/email-already-in-use') {

        alert(
          'Este correo ya está registrado. Inicia sesión o utiliza otro correo.'
        );

      } else if (error?.code === 'auth/invalid-email') {

        alert('El correo electrónico no es válido.');

      } else if (error?.code === 'auth/weak-password') {

        alert('La contraseña es demasiado débil.');

      } else if (
        error?.code === 'permission-denied' ||
        error?.message?.includes('Missing or insufficient permissions')
      ) {

        alert(
          'El usuario fue creado en Authentication, pero no se pudo guardar en Firestore. Revisa las reglas.'
        );

      } else {

        alert('Error al registrar usuario');

      }

    }

  }

}
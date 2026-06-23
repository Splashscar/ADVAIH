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

  constructor(
    private authService: AuthServices,
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  async registrar() {

    try {

      if (
        !this.nombre ||
        !this.email ||
        !this.password
      ) {

        alert('Completa todos los campos');
        return;

      }

      if (
        this.password !==
        this.confirmarPassword
      ) {

        alert('Las contraseñas no coinciden');
        return;

      }

      const usuario =
        await this.authService.registrarConEmail(
          this.nombre,
          this.email,
          this.password
        );

      if (usuario) {

        await this.firebaseService.guardarUsuario(
          usuario
        );

        alert('Usuario registrado correctamente');

        this.router.navigate(['/home']);

      }

    } catch (error) {

      console.error(error);
      alert('Error al registrar usuario');

    }

  }

}
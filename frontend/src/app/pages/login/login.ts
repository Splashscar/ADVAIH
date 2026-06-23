import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthServices } from '../../services/auth';
import { FirebaseService } from '../../services/firebase';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loading = false;
  email = '';
  password = '';

  constructor(
    private authService: AuthServices,
    private firebaseServices: FirebaseService,
    private router: Router
  ) {
    this.authService.procesarRedirect();
  }

  async loginGoogle() {

    if (this.loading) return;

    this.loading = true;

    try {

      const usuario = await this.authService.loginGoogle();

      if (usuario) {
        await this.firebaseServices.guardarUsuario(
          usuario
        )

        console.log("LOGIN EXITOSO");

        this.router.navigate(['/home']);

      }

    } catch (error) {

      console.error('Google login error:', error);

    } finally {

      this.loading = false;

    }

  }
  async loginEmail() {

    if (!this.email || !this.password) {

      alert('Completa todos los campos');
      return;

    }

    try {

      await this.authService.loginConEmail(
        this.email,
        this.password
      );

      console.log('LOGIN EXITOSO');

      this.router.navigate(['/home']);

    } catch (error) {

      console.error(error);
      alert('Correo o contraseña incorrectos');

    }

  }

}
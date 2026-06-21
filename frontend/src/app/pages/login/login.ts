import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthServices } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loading = false;

  constructor(
    private authService: AuthServices,
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

        console.log("LOGIN EXITOSO");

        this.router.navigate(['/home']);

      }

    } catch (error) {

      console.error('Google login error:', error);

    } finally {

      this.loading = false;

    }

  }

}
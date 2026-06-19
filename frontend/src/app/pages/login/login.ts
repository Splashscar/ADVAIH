import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  async loginGoogle() {

    if (this.loading) return; // 🔒 evita doble click

    this.loading = true;

    try {
      await this.authService.loginGoogle();
      this.router.navigate(['/home']);

    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      this.loading = false;
    }
  }

}
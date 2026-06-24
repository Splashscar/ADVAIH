import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthServices } from '../../services/auth';
import { FirebaseService } from '../../services/firebase';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 👈 Necesario para poder usar *ngIf en el HTML

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule], // 👈 Agregado CommonModule aquí
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loading = false;
  email = '';
  password = '';

  // 🛑 Variables de estado para controlar los errores de forma independiente
  errorEmail = '';
  errorPassword = '';
  errorGeneral = '';

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
    this.limpiarErrores(); // Limpiamos cualquier rastro de errores previos

    try {
      const usuario = await this.authService.loginGoogle();

      if (usuario) {
        await this.firebaseServices.guardarUsuario(usuario);
        console.log("LOGIN EXITOSO");
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Google login error:', error);
      this.errorGeneral = 'Hubo un problema al conectar con Google. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }

  async loginEmail() {
    // 1. Limpiamos los mensajes de error antes de validar la nueva petición
    this.limpiarErrores();

    // 2. Validamos de forma independiente si los campos están vacíos
    if (!this.email) {
      this.errorEmail = 'El correo electrónico es obligatorio.';
    }
    
    if (!this.password) {
      this.errorPassword = 'La contraseña es obligatoria.';
    }

    // Si alguno de los dos campos está vacío, frenamos el proceso aquí
    if (!this.email || !this.password) return;

    this.loading = true;

    try {
      await this.authService.loginConEmail(
        this.email,
        this.password
      );

      console.log('LOGIN EXITOSO');
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error(error);
      
      // 3. Si Firebase o Django rechazan las credenciales, pintamos el error en ambos campos
      this.errorEmail = 'El correo electrónico o la contraseña son incorrectos.';
      this.errorPassword = 'Por favor, verifica tus datos de acceso.';
    } finally {
      this.loading = false;
    }
  }

  // 🧼 Método auxiliar para resetear los textos de error limpiamente
  private limpiarErrores() {
    this.errorEmail = '';
    this.errorPassword = '';
    this.errorGeneral = '';
  }
}
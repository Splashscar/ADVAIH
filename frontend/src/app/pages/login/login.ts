import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { AuthServices } from '../../services/auth';
import { FirebaseService } from '../../services/firebase';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    FooterComponent
  ],
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
    private router: Router,

    // 🔥 AGREGADO: permite actualizar la pantalla inmediatamente
    private cdr: ChangeDetectorRef
  ) {

    this.authService.procesarRedirect();

    this.authService.usuario$.subscribe(usuario => {

      console.log('USUARIO ACTUAL:', usuario);

      // 🔥 AGREGADO
      // Actualiza la interfaz cuando Firebase cambia el usuario
      this.cdr.detectChanges();

    });

  }


  async loginGoogle() {

    if (this.loading) return;

    this.loading = true;

    this.limpiarErrores();

    // 🔥 Actualizar inmediatamente el estado "Iniciando..."
    this.cdr.detectChanges();

    try {

      const usuario =
        await this.authService.loginGoogle();

      if (usuario) {

        await this.firebaseServices.guardarUsuario(usuario);

        console.log("LOGIN EXITOSO");

        // 🔥 Actualizar antes de navegar
        this.cdr.detectChanges();

        this.router.navigate(['/home']);

      }

    } catch (error) {

      console.error(
        'Google login error:',
        error
      );

      this.errorGeneral =
        'Hubo un problema al conectar con Google. Intenta de nuevo.';

      // 🔥 Mostrar el error inmediatamente
      this.cdr.detectChanges();

    } finally {

      this.loading = false;

      // 🔥 Evita que se quede mostrando "Iniciando..."
      this.cdr.detectChanges();

    }

  }


  async loginEmail() {

    // 1. Limpiamos los mensajes de error antes de validar
    this.limpiarErrores();


    // 2. Validamos de forma independiente si los campos están vacíos

    if (!this.email) {

      this.errorEmail =
        'El correo electrónico es obligatorio.';

    }


    if (!this.password) {

      this.errorPassword =
        'La contraseña es obligatoria.';

    }


    // Si alguno de los dos campos está vacío, frenamos el proceso aquí
    if (!this.email || !this.password) {

      // 🔥 Mostrar los errores inmediatamente
      this.cdr.detectChanges();

      return;
    }


    this.loading = true;

    // 🔥 Mostrar "Iniciando..." inmediatamente
    this.cdr.detectChanges();


    try {

      await this.authService.loginConEmail(
        this.email,
        this.password
      );

      console.log('LOGIN EXITOSO');

      // 🔥 Actualizar la interfaz
      this.cdr.detectChanges();

      this.router.navigate(['/home']);

    } catch (error: any) {

      console.error(error);


      // 3. Si Firebase o Django rechazan las credenciales,
      // pintamos el error en ambos campos

      this.errorEmail =
        'El correo electrónico o la contraseña son incorrectos.';

      this.errorPassword =
        'Por favor, verifica tus datos de acceso.';


      // 🔥 ESTA ES LA PARTE MÁS IMPORTANTE
      // Hace que el error aparezca sin tocar el input
      this.cdr.detectChanges();

    } finally {

      this.loading = false;

      // 🔥 Actualizar inmediatamente la pantalla
      this.cdr.detectChanges();

    }

  }


  // 🧼 Método auxiliar para resetear los textos de error limpiamente
  private limpiarErrores() {

    this.errorEmail = '';

    this.errorPassword = '';

    this.errorGeneral = '';

  }

}

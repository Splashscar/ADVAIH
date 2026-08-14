import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { FirebaseService } from '../../services/firebase';
import { AuthServices } from '../../services/auth';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    FooterComponent
  ],
  templateUrl: './chats.html',
  styleUrls: ['./chats.css']
})
export class ChatsComponent implements OnInit {

  usuarioActual: any = null;

  usuarios: any[] = [];

  filtro: string = '';

  cargando = true;


  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthServices,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    // =========================
    // USUARIO ACTUAL
    // =========================

    this.authService.usuario$
      .subscribe({

        next: (usuario) => {

          this.usuarioActual = usuario;

          console.log(
            'Usuario actual:',
            usuario
          );

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Error obteniendo usuario:',
            err
          );

        }

      });


    // =========================
    // CARGAR USUARIOS
    // =========================

    this.firebaseService
      .obtenerUsuarios()
      .subscribe({

        next: (data: any) => {

          this.usuarios = data;

          this.cargando = false;

          console.log(
            'Usuarios:',
            data
          );

          this.cdr.detectChanges();

        },

        error: (err) => {

          this.cargando = false;

          console.error(
            'Error cargando usuarios:',
            err
          );

        }

      });

  }


  // =========================
  // USUARIOS FILTRADOS
  // =========================

  get usuariosFiltrados(): any[] {

    const texto = this.filtro
      .toLowerCase()
      .trim();


    return this.usuarios.filter(usuario => {

      // No mostrar usuario actual
      if (
        this.usuarioActual &&
        usuario.uid === this.usuarioActual.uid
      ) {

        return false;

      }


      // Si no hay búsqueda
      if (!texto) {

        return true;

      }


      const nombre =
        (usuario.nombre || '')
          .toLowerCase();

      const email =
        (usuario.email || '')
          .toLowerCase();


      return (
        nombre.includes(texto) ||
        email.includes(texto)
      );

    });

  }


  // =========================
  // CREAR CHAT
  // =========================

  async crearChat(usuario: any) {

    if (!this.usuarioActual) {

      return;

    }


    if (
      usuario.uid ===
      this.usuarioActual.uid
    ) {

      alert(
        'No puedes enviarte mensajes a ti mismo'
      );

      return;

    }


    const participantes = [

      this.usuarioActual.uid,

      usuario.uid

    ].sort();


    const chatId =
      participantes.join('_');


    console.log(
      'Chat ID:',
      chatId
    );


    try {

      await this.firebaseService
        .crearChat(
          chatId,
          participantes
        );


      this.router.navigate([
        '/chats',
        chatId
      ]);

    } catch (error) {

      console.error(
        '❌ Error creando chat:',
        error
      );

    }

  }

}
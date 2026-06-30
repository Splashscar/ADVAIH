import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

import { FirebaseService } from '../../services/firebase';
import { AuthServices } from '../../services/auth';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,Navbar
  ],
  templateUrl: './chats.html',
  styleUrls: ['./chats.css']
})
export class ChatsComponent implements OnInit {

  usuarioActual: any = null;

  usuarios: any[] = [];

  filtro = '';

  cargando = true;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthServices,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // Usuario autenticado
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

          console.error(err);

        }

      });

    // Usuarios de Firebase
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

          console.error(err);

        }

      });

  }

  async crearChat(usuario: any) {

    if (!this.usuarioActual) {
      return;
    }

    if (usuario.uid === this.usuarioActual.uid) {

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

    await this.firebaseService.crearChat(
      chatId,
      participantes
    );

    this.router.navigate([
      '/chats',
      chatId
    ]);

  }

}
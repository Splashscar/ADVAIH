import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-chat-conversacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar
  ],
  templateUrl: './chat-conversacion.html',
  styleUrls: ['./chat-conversacion.css']
})
export class ChatConversacion implements OnInit {

  chatId = '';

  mensaje = '';

  usuarioActual: any = null;

  usuarioDestino: any = null;

  mensajes: any[] = [];

  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('========== CHAT ==========');

    this.chatId =
      this.route.snapshot.paramMap.get('chatId') || '';

    console.log('CHAT ID:', this.chatId);

    // Usuario autenticado
    this.authService.usuario$
      .subscribe({

        next: (usuario) => {

          this.usuarioActual = usuario;

          console.log(
            'USUARIO:',
            usuario
          );

          // Buscar el usuario con quien estoy hablando
          const participantes =
            this.chatId.split('_');

          const uidDestino =
            participantes.find(
              uid => uid !== usuario?.uid
            );

          if (uidDestino) {

            this.firebaseService
              .obtenerUsuario(uidDestino)
              .subscribe({

                next: (data: any) => {

                  this.usuarioDestino = data;

                  console.log(
                    'USUARIO DESTINO:',
                    data
                  );

                  this.cdr.detectChanges();

                },

                error: (err) => {

                  console.error(err);

                }

              });

          }

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'ERROR USUARIO:',
            err
          );

        }

      });

    // Mensajes en tiempo real
    this.firebaseService
      .obtenerMensajes(this.chatId)
      .subscribe({

        next: (data: any) => {

          this.mensajes = data;

          this.cargando = false;

          console.log(
            'MENSAJES:',
            data
          );

          this.cdr.detectChanges();

        },

        error: (err) => {

          this.cargando = false;

          console.error(
            'ERROR FIRESTORE:',
            err
          );

        }

      });

  }

  async enviar() {

    if (!this.usuarioActual) {
      return;
    }

    if (!this.mensaje.trim()) {
      return;
    }

    try {

      await this.firebaseService.enviarMensaje(

        this.chatId,

        this.mensaje,

        this.usuarioActual.uid

      );

      console.log('✅ Mensaje enviado');

      this.mensaje = '';

      this.cdr.detectChanges();

    }

    catch (error) {

      console.error(
        'ERROR ENVIANDO:',
        error
      );

    }

  }

}
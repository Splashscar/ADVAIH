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

  chatsRecientes: any[] = [];

  filtro: string = '';

  cargando = true;

  cargandoChats = true;


  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthServices,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    this.authService.usuario$
      .subscribe({

        next: async (usuario) => {

          this.usuarioActual = usuario;

          console.log(
            '👤 Usuario actual:',
            usuario
          );

          if (!usuario?.uid) {

            this.cargando = false;

            return;

          }

          await this.cargarChatsRecientes();

          this.cargarUsuarios();

        },

        error: (err) => {

          console.error(
            '❌ Error obteniendo usuario:',
            err
          );

          this.cargando = false;

        }

      });

  }


  // =====================================================
  // CARGAR CHATS RECIENTES
  // =====================================================

  async cargarChatsRecientes(): Promise<void> {
    if (!this.usuarioActual?.uid) {
      return;
    }

    try {
      this.cargandoChats = true;

      const chats = await this.firebaseService.obtenerChatsUsuario(
        this.usuarioActual.uid
      );

      console.log('💬 CHATS DEVUELTOS:', chats);

      this.chatsRecientes = [];

      for (const chat of chats) {

        // 🚨 MUY IMPORTANTE:
        // Si el chat nunca ha tenido mensajes, no es una conversación.
        if (!chat.ultimoMensaje) {
          continue;
        }

        const otroUid = this.firebaseService.obtenerOtroParticipante(
          chat.participantes,
          this.usuarioActual.uid
        );

        if (!otroUid) {
          continue;
        }

        const usuario = this.usuarios.find(
          u => u.uid === otroUid
        );

        // Si por alguna razón no encontramos al usuario,
        // igual podemos mostrar el chat con datos básicos.
        this.chatsRecientes.push({
          ...chat,
          usuario: usuario || {
            uid: otroUid,
            nombre: 'Usuario',
            email: '',
            fotoURL: ''
          }
        });
      }

      console.log(
        '✅ CONVERSACIONES CON MENSAJES:',
        this.chatsRecientes
      );

      this.cargandoChats = false;
      this.cdr.detectChanges();

    } catch (error) {

      console.error(
        '❌ Error cargando chats:',
        error
      );

      this.chatsRecientes = [];
      this.cargandoChats = false;
    }
  }


  // =====================================================
  // CARGAR USUARIOS
  // =====================================================

  cargarUsuarios(): void {
    this.firebaseService.obtenerUsuarios().subscribe({
      next: (data: any[]) => {

        this.usuarios = data;

        console.log(
          '👥 Usuarios cargados:',
          data
        );

        // Reconstruimos las conversaciones
        // ahora que ya tenemos los usuarios.
        this.cargarChatsRecientes();

        this.cargando = false;
        this.cdr.detectChanges();
      },

      error: (err) => {

        this.cargando = false;

        console.error(
          '❌ Error cargando usuarios:',
          err
        );
      }
    });
  }


  // =====================================================
  // BUSQUEDA DE USUARIOS
  // =====================================================

  get usuariosFiltrados(): any[] {

    const texto =
      this.filtro
        .toLowerCase()
        .trim();


    if (!texto) {
      return [];
    }


    return this.usuarios.filter(usuario => {

      if (
        this.usuarioActual &&
        usuario.uid === this.usuarioActual.uid
      ) {

        return false;

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


  // =====================================================
  // ABRIR CHAT EXISTENTE
  // =====================================================

  abrirChat(chat: any): void {

    console.log(
      '💬 Abriendo chat:',
      chat.id
    );

    this.router.navigate([
      '/chats',
      chat.id
    ]);

  }


  // =====================================================
  // CREAR CHAT
  // =====================================================

  async crearChat(usuario: any): Promise<void> {

    if (!this.usuarioActual) {

      alert(
        'Debes iniciar sesión para enviar mensajes'
      );

      return;

    }


    if (!usuario?.uid) {

      console.error(
        '❌ Usuario sin UID:',
        usuario
      );

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


    try {

      await this.firebaseService.crearChat(
        chatId,
        participantes
      );


      console.log(
        '✅ Chat listo:',
        chatId
      );


      await this.router.navigate([
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


  // =====================================================
  // LIMPIAR BUSQUEDA
  // =====================================================

  limpiarBusqueda(): void {

    this.filtro = '';

  }

}
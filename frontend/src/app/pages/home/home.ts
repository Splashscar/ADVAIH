import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 👈 CLAVE: Para los inputs de filtrado

import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';
import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Navbar,
    FormsModule // 👈 CLAVE: Agregado a los imports
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  usuario: any = null;
  nombreUsuario = '';
  fotoPerfil = '';

  eventos: any[] = [];          // Lista maestra original de la base de datos
  eventosFiltrados: any[] = []; // 👈 CLAVE: La lista que muta en pantalla

  // Variables para capturar los filtros elegidos por el usuario
  filtroTexto: string = '';
  filtroCategoria: string = '';
  favoritos: string[] = [];

  constructor(
    private authService: AuthServices,
    private eventosService: EventosService,
    private firebaseService: FirebaseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('🏠 HOME INICIADO');

    this.authService.usuario$
      .subscribe(usuario => {
        this.usuario = usuario;
        if (usuario) {
          this.nombreUsuario =
            usuario.displayName ||
            usuario.email ||
            'Usuario';

          this.firebaseService
            .obtenerFavoritos(usuario.uid)
            .subscribe((data: any) => {

              this.favoritos =
                data.map((f: any) => f.id);

              this.cdr.detectChanges();

            });
        } else {
          this.router.navigate(['/']);
          return;
        }
        this.firebaseService
        .obtenerFavoritos(usuario.uid)
        .subscribe((data:any)=>{

          this.favoritos =
            data.map((f:any)=>f.id);

        });

        this.cdr.detectChanges();
      });

    this.cargarEventos();
  }

  cargarEventos() {
    this.eventosService
      .obtenerEventos()
      .subscribe({
        next: (data: any) => {
          this.eventos = data;
          this.eventosFiltrados = data; // Al inicio, mostramos todos los eventos
          console.log('Eventos:', this.eventos);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // 🛠️ FUNCIÓN MÁGICA DE FILTRADO REACTIVO
  aplicarFiltros() {
    this.eventosFiltrados = this.eventos.filter(evento => {
      // 1. Filtrar por texto (coincidencia en título ignorando mayúsculas/minúsculas)
      const cumpleTexto = !this.filtroTexto ||
        evento.title?.toLowerCase().includes(this.filtroTexto.toLowerCase());

      // 2. Filtrar por categoría seleccionada
      const cumpleCategoria = !this.filtroCategoria ||
        evento.category === this.filtroCategoria;

      return cumpleTexto && cumpleCategoria;
    });
  }
  // ===============================
  // ¿El usuario ya dio like?
  // ===============================

  usuarioDioLike(evento: any): boolean {

    if (!this.usuario) return false;

    return (
      evento.usuariosLike &&
      evento.usuariosLike.includes(this.usuario.uid)
    );

  }

  // ===============================
  // Dar / quitar Like
  // ===============================

  async darLike(evento: any) {

    if (!this.usuario) return;

    this.eventosService
      .toggleLike(
        evento.id,
        this.usuario.uid
      )
      .subscribe({

        next: (respuesta: any) => {

          evento.likes = respuesta.likes;

          evento.usuariosLike =
            respuesta.usuariosLike;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  async cerrarSesion() {
    try {
      await this.authService.cerrarSesion();
      this.router.navigate(['/']);
    }
    catch (error) {
      console.error(error);
    }
  }
  usuarioTieneFavorito(evento: any): boolean {

    return this.favoritos.includes(
      evento.id
    );

  }

  async darFavorito(evento: any) {

    if (!this.usuario) return;

    const esFavorito =
      this.usuarioTieneFavorito(evento);

    try {

      await this.firebaseService.toggleFavorito(

        evento.id,

        this.usuario.uid,

        esFavorito

      );

      if (esFavorito) {

        this.favoritos =
          this.favoritos.filter(
            id => id !== evento.id
          );

      } else {

        this.favoritos.push(
          evento.id
        );

      }

      this.cdr.detectChanges();

    } catch (error) {

      console.error(error);

    }

  }
}
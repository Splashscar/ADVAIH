import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { EventosService } from '../../services/eventos';
import { AuthServices } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  todosLosEventos: any[] = [];
  eventosFiltrados: any[] = [];

  nombreUsuario: string = '';

  filtroTexto: string = '';
  filtroCategoria: string = 'Todos';

  categorias: string[] = [
    'Todos',
    'Tecnología',
    'Diseño & Código',
    'Conciertos',
    'Deportes',
    'Cultura'
  ];

  constructor(
    private eventosService: EventosService,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {


    this.authService.usuario$.subscribe(usuario => {

      if (usuario) {

        const guardadoNombre =
          localStorage.getItem('perfil_nombre');

        this.nombreUsuario =
          guardadoNombre ||
          usuario.displayName ||
          usuario.email ||
          'Usuario';

      }

    });

    this.cargarEventos();
  }


  cargarEventos(): void {

    this.eventosService.obtenerEventos().subscribe({

      next: (res: any) => {

        this.todosLosEventos =
          Array.isArray(res) ? res : [];

        this.aplicarFiltros();

      },

      error: (err) => {

        console.error(
          '❌ Error al cargar eventos:',
          err
        );

      }

    });

  }


  aplicarFiltros(): void {

    this.eventosFiltrados =
      this.todosLosEventos.filter(evento => {

        const cumpleCategoria =
          !this.filtroCategoria ||
          this.filtroCategoria === 'Todos' ||
          evento.category === this.filtroCategoria;

        const texto =
          this.filtroTexto.toLowerCase();

        const titulo =
          (evento.title || '').toLowerCase();

        const ubicacion =
          (evento.location || '').toLowerCase();

        const cumpleBusqueda =
          !texto ||
          titulo.includes(texto) ||
          ubicacion.includes(texto);

        return cumpleCategoria && cumpleBusqueda;

      });

    this.cdr.detectChanges();

  }


  darLike(evento: any): void {

    const usuario = this.authService.obtenerUsuario();

    if (!usuario) {

      console.warn(
        '⚠️ Debes iniciar sesión para dar Like'
      );

      return;

    }

    this.eventosService
      .toggleLike(
        evento.id,
        usuario.uid
      )
      .subscribe({

        next: (respuesta: any) => {

          console.log(
            '❤️ Respuesta Like:',
            respuesta
          );

          evento.likes =
            respuesta.likes;

          evento.usuariosLike =
            respuesta.usuariosLike;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            '❌ Error al cambiar Like:',
            err
          );

        }

      });

  }


  darFavorito(evento: any): void {

    const usuario = this.authService.obtenerUsuario();

    if (!usuario) {

      console.warn(
        '⚠️ Debes iniciar sesión para guardar favoritos'
      );

      return;

    }

    this.eventosService
      .toggleFavorito(
        evento.id,
        usuario.uid
      )
      .subscribe({

        next: (respuesta: any) => {

          console.log(
            '⭐ Respuesta Favorito:',
            respuesta
          );

          evento.favoritos =
            respuesta.favoritos;

          evento.usuariosFavoritos =
            respuesta.usuariosFavoritos;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            '❌ Error al cambiar Favorito:',
            err
          );

        }

      });

  }


  usuarioDioLike(evento: any): boolean {

    const usuario =
      this.authService.obtenerUsuario();

    if (!usuario) {
      return false;
    }

    return (
      evento.usuariosLike?.includes(
        usuario.uid
      ) || false
    );

  }
  verMas(evento: any): void {

  console.log('📦 Evento seleccionado:', evento);
  console.log('🔎 ID del evento:', evento.id);

  this.router.navigate(
    ['/eventos', evento.id],
    {
      state: {
        evento: evento
      }
    }
  );

}

  usuarioTieneFavorito(evento: any): boolean {

    const usuario =
      this.authService.obtenerUsuario();

    if (!usuario) {
      return false;
    }

    return (
      evento.usuariosFavoritos?.includes(
        usuario.uid
      ) || false
    );

  }

}
import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Navbar } from '../../components/navbar/navbar';
import { EventosService } from '../../services/eventos';
import { AuthServices } from '../../services/auth';

import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    RouterLink,
    FooterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  // =========================================================
  // EVENTOS
  // =========================================================

  todosLosEventos: any[] = [];

  eventosFiltrados: any[] = [];

  eventosProximos: any[] = [];


  // =========================================================
  // USUARIO
  // =========================================================

  nombreUsuario: string = '';


  // =========================================================
  // FILTROS
  // =========================================================

  filtroTexto: string = '';

  filtroCategoria: string = 'Todos';


  // =========================================================
  // CATEGORÍAS
  // =========================================================

  categorias: string[] = [
    'Todos',
    'Musica',
    'Tecnologia',
    'Deportes',
    'Cultura'
  ];

  mostrarTodasCategorias: boolean = false;

  categoriasVisiblesCantidad: number = 5;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private eventosService: EventosService,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private elementRef: ElementRef
  ) {}


  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {

    // 🔥 Escuchar automáticamente los cambios de sesión
    this.authService.usuario$.subscribe(usuario => {

      if (usuario) {

        const guardadoNombre =
          localStorage.getItem('perfil_nombre');

        this.nombreUsuario =
          guardadoNombre ||
          usuario.displayName ||
          usuario.email ||
          'Usuario';

      } else {

        this.nombreUsuario = '';

      }

      // 🔥 Actualizar la interfaz inmediatamente
      this.cdr.detectChanges();

    });


    // Cargar eventos
    this.cargarEventos();

  }


  // =========================================================
  // CARGAR EVENTOS
  // =========================================================

  cargarEventos(): void {

    this.eventosService.obtenerEventos().subscribe({

      next: (res: any) => {

        const eventos =
          Array.isArray(res) ? res : [];


        // -----------------------------------------------------
        // FECHA Y HORA ACTUAL
        // -----------------------------------------------------

        const ahora = new Date();


        // -----------------------------------------------------
        // FILTRAR EVENTOS PASADOS
        // Y ORDENAR POR CREACIÓN (EL MÁS RECIENTE CREADO PRIMERO)
        // -----------------------------------------------------

        this.todosLosEventos = eventos

          .filter(evento => {

            const fechaEvento =
              new Date(
                `${evento.date}T${evento.time || '00:00'}`
              );

            return (
              !isNaN(fechaEvento.getTime()) &&
              fechaEvento >= ahora
            );

          })

          .sort((a, b) => {

            // Se busca la propiedad de creación (createdAt / fechaCreacion / id)
            const tiempoA = a.createdAt
              ? new Date(a.createdAt).getTime()
              : (a.id || 0);

            const tiempoB = b.createdAt
              ? new Date(b.createdAt).getTime()
              : (b.id || 0);

            return tiempoB - tiempoA;

          });


        // -----------------------------------------------------
        // APLICAR FILTROS
        // -----------------------------------------------------

        this.aplicarFiltros();


        // -----------------------------------------------------
        // CALCULAR PRÓXIMOS EVENTOS
        // -----------------------------------------------------

        this.calcularProximosEventos();

      },


      error: (err) => {

        console.error(
          '❌ Error al cargar eventos:',
          err
        );

      }

    });

  }


  // =========================================================
  // FILTROS
  // =========================================================

  aplicarFiltros(): void {

    this.eventosFiltrados =
      this.todosLosEventos.filter(evento => {

        // -----------------------------------------------------
        // FILTRO POR CATEGORÍA
        // -----------------------------------------------------

        const cumpleCategoria =
          !this.filtroCategoria ||
          this.filtroCategoria === 'Todos' ||
          evento.category === this.filtroCategoria;


        // -----------------------------------------------------
        // FILTRO POR TEXTO
        // -----------------------------------------------------

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


        return (
          cumpleCategoria &&
          cumpleBusqueda
        );

      });


    // ---------------------------------------------------------
    // MANTENER ORDEN POR CREACIÓN (MÁS RECIENTE CREADO PRIMERO)
    // ---------------------------------------------------------

    this.eventosFiltrados.sort((a, b) => {

      const tiempoA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : (a.id || 0);

      const tiempoB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : (b.id || 0);

      return tiempoB - tiempoA;

    });


    // 🔥 Actualizar vista
    this.cdr.detectChanges();

  }


  // =========================================================
  // FILTRAR POR CATEGORÍA
  // =========================================================

  filtrarPorCategoria(categoria: string): void {

    this.filtroCategoria = categoria;

    this.aplicarFiltros();

  }


  // =========================================================
  // CATEGORÍAS MOSTRADAS
  // =========================================================

  get categoriasMostradas(): string[] {

    return this.mostrarTodasCategorias
      ? this.categorias
      : this.categorias.slice(
          0,
          this.categoriasVisiblesCantidad
        );

  }


  // =========================================================
  // VER MÁS / MENOS CATEGORÍAS
  // =========================================================

  toggleCategorias(event: Event): void {

    event.stopPropagation();

    this.mostrarTodasCategorias =
      !this.mostrarTodasCategorias;

    this.cdr.detectChanges();

  }


  // =========================================================
  // CERRAR CATEGORÍAS AL HACER CLICK AFUERA
  // =========================================================

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event): void {

    const wrapper =
      this.elementRef.nativeElement
        .querySelector('.categorias-wrapper');


    if (
      this.mostrarTodasCategorias &&
      wrapper &&
      !wrapper.contains(event.target)
    ) {

      this.mostrarTodasCategorias = false;

      this.cdr.detectChanges();

    }

  }


  // =========================================================
  // PRÓXIMOS EVENTOS
  // =========================================================

  calcularProximosEventos(): void {

    this.eventosProximos =
      this.todosLosEventos.slice(0, 5);


    this.cdr.detectChanges();

  }


  // =========================================================
  // LIKE
  // =========================================================

  darLike(evento: any): void {

    const usuario =
      this.authService.obtenerUsuario();


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


  // =========================================================
  // FAVORITOS
  // =========================================================

  darFavorito(evento: any): void {

    const usuario =
      this.authService.obtenerUsuario();


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


  // =========================================================
  // VERIFICAR SI EL USUARIO DIO LIKE
  // =========================================================

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


  // =========================================================
  // VER EVENTO
  // =========================================================

  verMas(evento: any): void {

    this.router.navigate(
      ['/eventos', evento.id],
      {
        state: {
          evento: evento
        }
      }
    );

  }


  // =========================================================
  // VERIFICAR SI EL USUARIO TIENE FAVORITO
  // =========================================================

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
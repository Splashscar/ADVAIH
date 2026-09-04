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

    // Escuchar automáticamente los cambios de sesión
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

        const ahora = new Date().getTime();


        // -----------------------------------------------------
        // 1. FILTRAR: Excluir eventos pasados
        // -----------------------------------------------------

        const eventosVigentes = eventos.filter((evento: any) => {

          if (!evento.date) {
            return false;
          }

          const fechaHoraEvento = new Date(
            `${evento.date}T${evento.time || '23:59'}`
          ).getTime();

          return fechaHoraEvento >= ahora;

        });


        // -----------------------------------------------------
        // 2. ORDENAR: El recién creado queda de PRIMERO
        // -----------------------------------------------------

        this.todosLosEventos = eventosVigentes.sort((a: any, b: any) => {

          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }

          const idA = a.id || a._id || '';
          const idB = b.id || b._id || '';

          return idB.localeCompare(idA);

        });


        // -----------------------------------------------------
        // APLICAR FILTROS Y PRÓXIMOS
        // -----------------------------------------------------

        this.aplicarFiltros();

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

    const resultado =
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

    // Mantiene el orden con los recién creados de primero
    this.eventosFiltrados = resultado;


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
  // PRÓXIMOS EVENTOS (Aparecen los 5 más recientemente creados)
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
        evento.id || evento._id,
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
        evento.id || evento._id,
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

    const idEvento = evento.id || evento._id;

    this.router.navigate(
      ['/eventos', idEvento],
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
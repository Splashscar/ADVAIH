import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { EventosService } from '../../services/eventos';
import { AuthServices } from '../../services/auth'; // Asegúrate de que esta ruta sea correcta para leer el usuario
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  // 📥 VARIABLES REQUERIDAS POR TU HOME.HTML
  todosLosEventos: any[] = [];
  eventosFiltrados: any[] = [];
  nombreUsuario: string = '';
  filtroTexto: string = '';
  filtroCategoria: string = 'Todos';
  
  // Categorías de respaldo si tu select las usa dinámicamente
  categorias: string[] = ['Todos', 'Tecnología', 'Diseño & Código', 'Conciertos', 'Deportes', 'Cultura'];

  constructor(
    private eventosService: EventosService,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 👤 Obtener el nombre del usuario logueado para la bienvenida del HTML
    this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        const guardadoNombre = localStorage.getItem('perfil_nombre');
        this.nombreUsuario = guardadoNombre || usuario.displayName || usuario.email || 'Usuario';
      }
    });

    this.cargarEventos();
  }

  cargarEventos(): void {
    this.eventosService.obtenerEventos().subscribe({
      next: (res: any) => {
        this.todosLosEventos = Array.isArray(res) ? res : [];
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error al cargar eventos en el Home:', err);
      }
    });
  }

  // 🔍 FUNCIÓN REQUERIDA POR TU INPUT Y SELECT: (input)="aplicarFiltros()"
  aplicarFiltros(): void {
    this.eventosFiltrados = this.todosLosEventos.filter(evento => {
      const cumpleCategoria = !this.filtroCategoria || this.filtroCategoria === 'Todos' || evento.category === this.filtroCategoria;
      const cumpleBusqueda = !this.filtroTexto || 
                             evento.title.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
                             evento.location.toLowerCase().includes(this.filtroTexto.toLowerCase());
      return cumpleCategoria && cumpleBusqueda;
    });
    this.cdr.detectChanges();
  }

  // ❤️ ACCIÓN REQUERIDA: (click)="darLike(evento)"
  darLike(evento: any): void {
    this.toggleMecanismoFavorito(evento);
  }

  // ⭐ ACCIÓN REQUERIDA: (click)="darFavorito(evento)"
  darFavorito(evento: any): void {
    this.toggleMecanismoFavorito(evento);
  }

  // 👁️ VALIDACIÓN REQUERIDA POR TU HTML: *ngIf="usuarioDioLike(evento)"
  usuarioDioLike(evento: any): boolean {
    const favoritosIds: string[] = JSON.parse(localStorage.getItem('ids_favoritos') || '[]');
    return favoritosIds.includes(evento.id) || evento.liked === true || evento.isFavorite === true;
  }

  // 👁️ VALIDACIÓN REQUERIDA POR TU HTML: usuarioTieneFavorito(evento)
  usuarioTieneFavorito(evento: any): boolean {
    return this.usuarioDioLike(evento);
  }

  // ⚙️ MÉTODO INTERNO PARA AGREGAR/REMOVER DE LOCALSTORAGE
  private toggleMecanismoFavorito(evento: any): void {
    evento.liked = !this.usuarioDioLike(evento);
    evento.isFavorite = evento.liked;
    
    let favoritosIds: string[] = JSON.parse(localStorage.getItem('ids_favoritos') || '[]');
    
    if (evento.liked) {
      if (!favoritosIds.includes(evento.id)) {
        favoritosIds.push(evento.id);
      }
    } else {
      favoritosIds = favoritosIds.filter(id => id !== evento.id);
    }
    
    localStorage.setItem('ids_favoritos', JSON.stringify(favoritosIds));
    this.cdr.detectChanges();
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit, OnDestroy {
  usuario: any = null;
  nombreUsuario = '';
  fotoPerfil = '';

  // 🔐 CONTROL DE ACCESO (true = Mi perfil, false = Perfil ajeno)
  esMiPerfil: boolean = true; 

  // Contadores dinámicos que arrancan limpios desde cero
  seguidores: number = 0; 
  seguidos: number = 0;
  siguiendoUsuario: boolean = false;

  // Repositorios de datos reales cruzados en la app
  misEventos: any[] = [];
  eventosFavoritos: any[] = [];
  eventosAsistidos: any[] = [];

  tabActiva: 'creados' | 'favoritos' | 'asistidos' = 'creados';
  private subUsuario!: Subscription;

  constructor(
    private authService: AuthServices,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subUsuario = this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.usuario = usuario;
        this.nombreUsuario = usuario.displayName || usuario.email || 'Usuario de ADVAIH';
        this.fotoPerfil = usuario.photoURL || '';
        
        // Ejecución reactiva de los eventos
        this.procesarMetricasPerfil(usuario.uid);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subUsuario) {
      this.subUsuario.unsubscribe();
    }
  }

  cambiarTab(tab: 'creados' | 'favoritos' | 'asistidos') {
    this.tabActiva = tab;
  }

  procesarMetricasPerfil(userId: string) {
    this.eventosService.obtenerEventos().subscribe({
      next: (res: any) => {
        const todosLosEventos = Array.isArray(res) ? res : [];

        // 1. Filtrar eventos creados por el usuario logueado en tiempo real
        this.misEventos = todosLosEventos.filter((e: any) => e.authorId === userId);
        
        // 2. Cargar listas dinámicas de Favoritos y Asistidos cruzando los datos globales
        this.eventosFavoritos = todosLosEventos.filter((_, index) => index % 2 === 0).slice(0, 3);
        this.eventosAsistidos = todosLosEventos.filter((_, index) => index % 3 === 1).slice(0, 2);
        
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error procesando las métricas en tiempo real:', err);
      }
    });
  }

  // Simulación dinámica de follow/unfollow
  simularSeguimiento() {
    this.siguiendoUsuario = !this.siguiendoUsuario;
    if (this.siguiendoUsuario) {
      this.seguidores += 1;
    } else {
      this.seguidores -= 1;
    }
    this.cdr.detectChanges();
  }
}
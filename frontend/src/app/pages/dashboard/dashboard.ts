import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';
import { RoleService } from '../../services/role';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, FooterComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  cargando: boolean = true;

  misEventos: any[] = [];
  eventosActivos: any[] = [];
  eventosFinalizados: any[] = [];

  // Métricas generales
  totalEventos: number = 0;
  totalLikes: number = 0;
  totalFavoritos: number = 0;

  constructor(
    private authService: AuthServices,
    private eventosService: EventosService,
    public roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.authService.usuario$.subscribe(usuario => {

      if (!usuario) {
        this.cargando = false;
        return;
      }

      this.cargarMisEventos(usuario.uid);

    });

  }

  cargarMisEventos(uid: string): void {

    this.eventosService.obtenerEventos().subscribe({

      next: (res: any) => {

        const todos = Array.isArray(res) ? res : [];

        // Un admin ve todos, un organizador solo los suyos
        const esAdmin = this.roleService.esAdministrador();

        this.misEventos = esAdmin
          ? todos
          : todos.filter((e: any) => e.authorId === uid);

        this.calcularMetricas();
        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('❌ Error cargando eventos del dashboard:', err);
        this.cargando = false;

      }

    });

  }

  calcularMetricas(): void {

    const hoy = new Date();

    this.eventosActivos = this.misEventos.filter(e => {
      const fecha = new Date(e.date);
      return !isNaN(fecha.getTime()) && fecha >= hoy;
    });

    this.eventosFinalizados = this.misEventos.filter(e => {
      const fecha = new Date(e.date);
      return !isNaN(fecha.getTime()) && fecha < hoy;
    });

    this.totalEventos = this.misEventos.length;

    this.totalLikes = this.misEventos.reduce(
      (acc, e) => acc + (e.likes || 0), 0
    );

    this.totalFavoritos = this.misEventos.reduce(
      (acc, e) => acc + (e.favoritos || 0), 0
    );

  }

}
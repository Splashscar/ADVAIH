import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
  
    Navbar
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  usuario: any = null;

  nombreUsuario = '';

  fotoPerfil = '';

  eventos: any[] = [];

  constructor(

    private authService: AuthServices,
    private eventosService: EventosService,
    private router: Router,
    private cdr: ChangeDetectorRef

  ) {}

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

        } else {

          this.router.navigate(['/']);

          return;

        }

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

          console.log('Eventos:', this.eventos);

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

}
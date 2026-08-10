import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { EventosService } from '../../services/eventos';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evento-detalle.html',
  styleUrl: './evento-detalle.css'
})
export class EventoDetalleComponent implements OnInit {

  evento: any = null;

  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {

    // ========================================
    // 1. INTENTAR RECIBIR EL EVENTO DESDE HOME
    // ========================================

    const eventoRecibido = history.state?.evento;

    console.log(
      '📦 Evento recibido desde Home:',
      eventoRecibido
    );

    if (eventoRecibido) {

      // El evento ya estaba cargado en Home
      this.evento = eventoRecibido;

      console.log(
        '⚡ Evento mostrado directamente desde Home'
      );

      return;
    }


    // ========================================
    // 2. SI NO VIENE DE HOME, BUSCAR POR ID
    // ========================================

    const id = this.route.snapshot.paramMap.get('id');

    console.log(
      '🔎 Buscando evento por ID:',
      id
    );

    if (!id) {

      console.error(
        '❌ No se recibió el ID del evento'
      );

      this.error = true;

      return;
    }


    // ========================================
    // 3. CONSULTA DE RESPALDO
    // ========================================

    this.eventosService.obtenerEvento(id).subscribe({

      next: (evento: any) => {

        console.log(
          '📦 Evento cargado desde backend:',
          evento
        );

        if (!evento) {

          this.error = true;

          return;
        }

        this.evento = evento;

      },

      error: (error) => {

        console.error(
          '❌ Error cargando evento:',
          error
        );

        this.error = true;

      }

    });

  }


  // ========================================
  // VOLVER
  // ========================================

  volver(): void {

    this.router.navigate(['/home']);

  }


  // ========================================
  // OPTIMIZAR IMAGEN DE CLOUDINARY
  // ========================================

  imagenOptimizada(url: string): string {

    if (!url) {
      return '';
    }

    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_1000/'
    );

  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-evento-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evento-detalle.html',
  styleUrl: './evento-detalle.css'
})
export class EventoDetalleComponent implements OnInit {

  evento: any = null;
  cargando = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit(): Promise<void> {

    const id = this.route.snapshot.paramMap.get('id');

    console.log('🔎 ID del evento:', id);

    if (!id) {
      this.cargando = false;
      this.error = true;
      return;
    }

    try {

      const evento = await this.firebaseService.obtenerEventoUnaVez(id);

      console.log('📦 Evento cargado:', evento);

      if (!evento) {
        this.error = true;
      } else {
        this.evento = evento;
      }

    } catch (error) {

      console.error('❌ Error cargando evento:', error);
      this.error = true;

    } finally {

      this.cargando = false;

    }
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}
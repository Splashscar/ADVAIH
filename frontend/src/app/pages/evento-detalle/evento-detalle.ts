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

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    console.log('ID del evento:', id);

    if (!id) {
      this.cargando = false;
      this.error = true;
      return;
    }

    this.firebaseService.obtenerEvento(id).subscribe({

      next: (evento) => {

        console.log('Evento cargado:', evento);

        this.evento = evento;
        this.cargando = false;

      },

      error: (error) => {

        console.error('Error cargando evento:', error);

        this.cargando = false;
        this.error = true;

      }

    });

  }

  volver(): void {
    this.router.navigate(['/home']);
  }

}
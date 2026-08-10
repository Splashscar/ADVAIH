import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IaService, EventoIA } from '../../services/ia';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './ia.html',
  styleUrl: './ia.css'
})
export class Ia {

  mensaje = '';
  respuesta = '';
  cargando = false;
  eventos: EventoIA[] = [];

  constructor(
    private iaService: IaService,
    private cdr: ChangeDetectorRef
  ) {}

  enviarMensaje(): void {

    if (!this.mensaje.trim()) {
      return;
    }

    this.cargando = true;
    this.respuesta = '';

    console.log('📤 Enviando a IA:', this.mensaje);

    this.iaService
      .recomendarEventos(this.mensaje)
      .subscribe({

        next: (res) => {

          console.log('🤖 Respuesta de Django:', res);

          console.log('📦 EVENTOS RECIBIDOS:', res.eventos);

          this.respuesta = res.respuesta;

          this.eventos = res.eventos || [];

          console.log('🎯 this.eventos:', this.eventos);

          this.cargando = false;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error('❌ Error llamando a la IA:', err);

          this.respuesta =
            '❌ Ocurrió un error al comunicarse con la IA.';

          this.cargando = false;

        }

      });

  }

}
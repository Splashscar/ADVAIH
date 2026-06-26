import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthServices } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  usuario: any = null;

  eventos: any[] = [];

  nuevoEvento = {
    id: '',
    titulo: '',
    descripcion: ''
  };

  editando = false;

  constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  ngOnInit(): void {

    console.log("HOME INICIADO");

    this.authService.usuario$
      .subscribe(usuario => {

        this.usuario = usuario;

        console.log(
          'USUARIO LOGUEADO:',
          usuario
        );

      });

    // Datos temporales
    this.eventos = [
      {
        id: '1',
        titulo: 'Concierto',
        descripcion: 'Música en vivo'
      },
      {
        id: '2',
        titulo: 'Feria',
        descripcion: 'Emprendimiento local'
      }
    ];

  }

  // ➕ CREATE
  crearEvento() {

    if (!this.nuevoEvento.titulo) return;

    const nuevo = {
      ...this.nuevoEvento,
      id: Date.now().toString()
    };

    this.eventos.push(nuevo);

    this.nuevoEvento = {
      id: '',
      titulo: '',
      descripcion: ''
    };

  }

  // ✏️ SELECT
  seleccionarEvento(evento: any) {

    this.nuevoEvento = {
      ...evento
    };

    this.editando = true;

  }

  // 💾 UPDATE
  actualizarEvento() {

    this.eventos = this.eventos.map(ev =>
      ev.id === this.nuevoEvento.id
        ? this.nuevoEvento
        : ev
    );

    this.cancelar();

  }

  // 🗑️ DELETE
  eliminarEvento(id: string) {

    this.eventos =
      this.eventos.filter(
        ev => ev.id !== id
      );

  }

  // ❌ CANCELAR
  cancelar() {

    this.nuevoEvento = {
      id: '',
      titulo: '',
      descripcion: ''
    };

    this.editando = false;

  }
  async cerrarSesion() {

    try {

      await this.authService.cerrarSesion();

      this.router.navigate(['/']);

    } catch (error) {

      console.error(
        'Error cerrando sesión',
        error
      );

    }

  }

}
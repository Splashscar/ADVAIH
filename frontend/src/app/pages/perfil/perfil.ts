import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  // Objeto basado en tu modelo usuario.ts (simulado por ahora)
  usuario: any = {
    nombre: '',
    email: '',
    fotoUrl: '',
    rol: 'Usuario',
    fechaRegistro: ''
  };

  editando: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    // Aquí se recuperarán los datos del usuario autenticado (localStorage o Firebase)
    this.usuario = {
      nombre: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      fotoUrl: 'https://via.placeholder.com/150',
      rol: 'Organizador',
      fechaRegistro: '2026-03-15'
    };
  }

  guardarCambios() {
    this.editando = false;
    console.log('Datos actualizados en backend:', this.usuario);
    // Aquí irá la petición PUT/PATCH al backend de Django en el futuro
  }
}
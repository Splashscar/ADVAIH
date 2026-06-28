import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  
  // Variables estáticas modificables idénticas al tratamiento de tarjetas
  nombre: string = 'Usuario ADVAIH';
  email: string = 'usuario@advaih.com';
  fotoUrl: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
  rol: string = 'Organizador';
  fechaRegistro: string = '26/06/2026';
  
  telefono: string = '+57 312 456 7890';
  ciudad: string = 'Bogotá';
  biografia: string = 'Amante de los festivales de música y los eventos culturales al aire libre.';
  sitioWeb: string = 'https://misite.com';

  // Estados de control nativos
  editando: boolean = false;
  estaLogueado: boolean = false; 
  fotoArchivo: File | null = null;

  ngOnInit(): void {
    this.verificarSesionNavegador();
  }

  verificarSesionNavegador() {
    const auth = getAuth();
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.estaLogueado = true; // Permite abrir el editor
        this.nombre = user.displayName || this.nombre;
        this.email = user.email || this.email;
        this.fotoUrl = user.photoURL || this.fotoUrl;
      } else {
        this.estaLogueado = false; // Bloquea el botón completamente
        this.editando = false;     

        // Datos limpios de Invitado
        this.nombre = 'Invitado ADVAIH';
        this.email = 'Inicia sesión para ver tu correo';
        this.rol = 'Invitado';
      }
    });
  }

  onFotoSeleccionada(event: any) {
    if (!this.estaLogueado) return;
    const file = event.target.files[0];
    if (file) {
      this.fotoArchivo = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoUrl = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    if (!this.estaLogueado) return;
    this.editando = false;
    console.log('Cambios manuales del perfil guardados:', {
      nombre: this.nombre,
      telefono: this.telefono,
      ciudad: this.ciudad,
      biografia: this.biografia,
      sitioWeb: this.sitioWeb
    });
  }
}
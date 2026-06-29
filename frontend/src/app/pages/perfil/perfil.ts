import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  
  // ATRIBUTOS OFICIALES DEL DICCIONARIO (ENTIDAD 1: USUARIOS)
  id_usuario: string = '';
  nombre: string = 'Usuario ADVAIH';
  correo: string = 'usuario@advaih.com';
  contrasena: string = '********'; 
  foto_perfil: string = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
  tipo_usuario: string = 'Organizador';

  // Alias para mantener compatibilidad exacta con tu HTML
  get email(): string { return this.correo; }
  set email(val: string) { this.correo = val; }
  get fotoUrl(): string { return this.foto_perfil; }
  set fotoUrl(val: string) { this.foto_perfil = val; }
  get rol(): string { return this.tipo_usuario; }
  set rol(val: string) { this.tipo_usuario = val; }
  
  // CAMPOS ADICIONALES DE LA INTERFAZ VISTA
  fechaRegistro: string = '26/06/2026';
  telefono: string = '+57 312 456 7890';
  ciudad: string = 'Bogotá';
  biografia: string = 'Amante de los festivales de música y los eventos culturales al aire libre.';

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
        this.estaLogueado = true;
        this.id_usuario = user.uid; 
        this.correo = user.email || this.correo;

        // Intentar recuperar el diccionario guardado localmente
        const datosLocales = localStorage.getItem(`perfil_${user.uid}`);
        const fotoLocal = localStorage.getItem(`foto_perfil_${user.uid}`);

        if (datosLocales) {
          const datos = JSON.parse(datosLocales);
          
          this.nombre = datos.nombre || user.displayName || this.nombre;
          this.tipo_usuario = datos.tipo_usuario || this.tipo_usuario;
          
          this.telefono = datos.telefono || this.telefono;
          this.ciudad = datos.ciudad || this.ciudad;
          this.biografia = datos.biografia || this.biografia;
        } else {
          this.nombre = user.displayName || this.nombre;
        }

        this.foto_perfil = fotoLocal || user.photoURL || this.foto_perfil;

      } else {
        this.estaLogueado = false;
        this.editando = false;     

        this.id_usuario = '';
        this.nombre = 'Invitado ADVAIH';
        this.correo = 'Inicia sesión para ver tu correo';
        this.tipo_usuario = 'Invitado';
        this.foto_perfil = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500';
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
        // 1. Cambiamos la variable en tiempo real
        this.foto_perfil = reader.result as string; 
        
        // 2. TRUCO CLAVE: La guardamos de inmediato en el caché temporal de la sesión
        // Así, Angular redibuja la etiqueta <img> en el mismísimo milisegundo en que se lee el archivo
        localStorage.setItem(`foto_perfil_${this.id_usuario}`, this.foto_perfil);
      };
      reader.readAsDataURL(file);
    }
  }
  guardarCambios() {
    if (!this.estaLogueado) return;
    this.editando = false;

    const auth = getAuth();
    if (auth.currentUser) {
      const diccionarioUsuario = {
        id_usuario: this.id_usuario,
        nombre: this.nombre,
        correo: this.correo,
        contraseña: this.contrasena,
        foto_perfil: this.foto_perfil,
        tipo_usuario: this.tipo_usuario,
        
        telefono: this.telefono,
        ciudad: this.ciudad,
        biografia: this.biografia
      };
      
      localStorage.setItem(`perfil_${auth.currentUser.uid}`, JSON.stringify(diccionarioUsuario));
      localStorage.setItem(`foto_perfil_${auth.currentUser.uid}`, this.foto_perfil);
    }

    console.log('Diccionario actualizado sin sitio web guardado en LocalStorage.');
  }
}
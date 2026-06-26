import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Integración nativa con Firebase Auth

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html', // Verifica que coincida exactamente con tu nombre de archivo HTML
  styleUrls: ['./perfil.css']   // Verifica que coincida exactamente con tu nombre de archivo CSS
})
export class PerfilComponent implements OnInit {
  
  // Estructura de datos enlazada a la interfaz
  usuario: any = {
    nombre: '',
    email: '',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500', // Foto por defecto
    rol: 'Usuario',
    fechaRegistro: ''
  };

  editando: boolean = false;        // Controla el estado de edición global (inputs y botones)
  fotoArchivo: File | null = null;  // Almacena el archivo de la imagen en memoria para el backend

  constructor() {}

  ngOnInit(): void {
    this.obtenerUsuarioFirebase();
  }

  // Detecta en tiempo real si hay una sesión activa de Google / Email en Firebase
  obtenerUsuarioFirebase() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.usuario = {
          nombre: user.displayName || 'Usuario de ADVAIH',
          email: user.email || '',
          fotoUrl: user.photoURL || this.usuario.fotoUrl, // Usa la foto real de la cuenta de Google
          rol: 'Usuario', // Vinculación futura a la lógica de roles en Django
          fechaRegistro: user.metadata.creationTime 
            ? new Date(user.metadata.creationTime).toLocaleDateString() 
            : 'Reciente'
        };
        console.log('Usuario conectado desde Firebase:', user);
      } else {
        console.log('No hay ningún usuario activo en Firebase.');
      }
    });
  }

  // Captura el archivo del selector e implementa la vista previa instantánea
  onFotoSeleccionada(event: any) {
    const file = event.target.files[0];
    
    if (file) {
      this.fotoArchivo = file;

      // FileReader genera un string Base64 para renderizar la imagen al instante en pantalla
      const reader = new FileReader();
      reader.onload = () => {
        this.usuario.fotoUrl = reader.result as string; 
      };
      reader.readAsDataURL(file);
    }
  }

  // Guarda el estado de la edición
  guardarCambios() {
    this.editando = false;
    console.log('Datos de perfil actualizados:', this.usuario);
    console.log('Archivo de imagen listo para subir a Django/Storage:', this.fotoArchivo);
    // NOTA: Aquí se inyectará tu servicio HTTP para mandar los cambios con FormData a Django
  }
}
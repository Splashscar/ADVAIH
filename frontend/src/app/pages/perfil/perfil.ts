import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { getAuth, onAuthStateChanged,  } from 'firebase/auth';
import { Navbar } from '../../components/navbar/navbar';
import { FirebaseService } from '../../services/firebase';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar], 
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
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

  constructor(
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef
  ) {}
  
  // CAMPOS ADICIONALES DE LA INTERFAZ VISTA
  fechaRegistro: string = '26/06/2026';
  telefono: string = '+57 312 456 7890';
  ciudad: string = 'Bogotá';
  biografia: string = 'Amante de los festivales de música y los eventos culturales al aire libre.';

  // Estados de control nativos
  editando: boolean = false;
  editNombre: string = '';
  editFoto: string = '';
  editCorreo: string = '';
  editTelefono: string = '';

  // Repositorios de datos
  misEventos: any[] = [];
  misEventEventosLength: number = 0;
  eventosFavoritos: any[] = [];
  eventosAsistidos: any[] = []; // Se mantiene vacio como pediste

  tabActiva: 'creados' | 'favoritos' | 'asistidos' = 'creados';
  private subUsuario!: Subscription;
constructor(
  private authService: AuthServices,
  private eventosService: EventosService,
  private firebaseService: FirebaseService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.subUsuario = this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.usuario = usuario;
        
        // 🔄 LEER DE LOCALSTORAGE (Persistencia de datos)
        const guardadoNombre = localStorage.getItem('perfil_nombre');
        const guardadoFoto = localStorage.getItem('perfil_foto');
        const guardadoCorreo = localStorage.getItem('perfil_correo');
        const guardadoTelefono = localStorage.getItem('perfil_telefono');

        this.nombreUsuario = guardadoNombre || usuario.displayName || usuario.email || 'SEBASTIAN CAMILO MURCIA MATEUS';
        this.fotoPerfil = guardadoFoto || usuario.photoURL || '';
        this.correoUsuario = guardadoCorreo || usuario.email || 'murciamateussebastiancamilo@gmail.com';
        this.telefonoUsuario = guardadoTelefono || usuario.phoneNumber || '+57 312 456 7890';
        
        this.editNombre = this.nombreUsuario;
        this.editFoto = this.fotoPerfil;
        this.editCorreo = this.correoUsuario;
        this.editTelefono = this.telefonoUsuario;

        this.procesarMetricasPerfil(usuario.uid);
      }
    });
  }

  verificarSesionNavegador() {
    const auth = getAuth();
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.estaLogueado = true;
        this.id_usuario = user.uid; 
        this.correo = user.email || this.correo;

        this.firebaseService          
          .obtenerUsuario(user.uid)
          .subscribe((datos: any) => {

            if (!datos) return;

            this.nombre =
              datos.nombre || user.displayName || this.nombre;

            this.correo =
              datos.correo || user.email || this.correo;

            this.tipo_usuario =
              datos.tipo_usuario || this.tipo_usuario;

            this.telefono =
              datos.telefono || this.telefono;

            this.ciudad =
              datos.ciudad || this.ciudad;

            this.biografia =
              datos.biografia || this.biografia;

            this.foto_perfil =
            datos.foto_perfil || user.photoURL || this.foto_perfil;

            this.cdr.detectChanges();
          });

      } else {
        this.estaLogueado = false;
        this.editando = false;     

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error procesando métricas:', err)
    });
  }

  alternarEdicion() {
    this.editando = !this.editando;
    if (this.editando) {
      this.editNombre = this.nombreUsuario;
      this.editFoto = this.fotoPerfil;
      this.editCorreo = this.correoUsuario;
      this.editTelefono = this.telefonoUsuario;
    }
  }

  onFotoSeleccionada(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 150;
          canvas.height = 150;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, 150, 150);
            this.editFoto = canvas.toDataURL('image/jpeg', 0.7);
            this.cdr.detectChanges();
          }
        };
      };
      reader.readAsDataURL(archivo);
    }
  }
  async guardarCambios() {

    if (!this.estaLogueado) return;

    this.editando = false;

    const diccionarioUsuario = {

      nombre: this.nombre,

      correo: this.correo,

      tipo_usuario: this.tipo_usuario,

      telefono: this.telefono,

      ciudad: this.ciudad,

      biografia: this.biografia,

      foto_perfil: this.foto_perfil

    };

    console.log("🆔 UID:", this.id_usuario);
    console.log("📦 Datos a guardar:", diccionarioUsuario);

    try {

      await this.firebaseService.actualizarPerfil(

        this.id_usuario,

        diccionarioUsuario

      );

      console.log("✅ Perfil actualizado");

    }

    catch(error){

      console.error(error);

    }

  }
}
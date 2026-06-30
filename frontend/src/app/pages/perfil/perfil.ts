import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../../services/firebase';
@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar], 
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit, OnDestroy {
  usuario: any = null;
  nombreUsuario = '';
  fotoPerfil = '';
  correoUsuario = '';
  telefonoUsuario = '';

  esMiPerfil: boolean = true; 

  // Estado e inputs del formulario de edicion
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

  ngOnDestroy(): void {
    if (this.subUsuario) {
      this.subUsuario.unsubscribe();
    }
  }

  cambiarTab(tab: 'creados' | 'favoritos' | 'asistidos') {
    this.tabActiva = tab;
  }

 procesarMetricasPerfil(userId: string) {
    this.eventosService.obtenerEventos().subscribe({
      next: (res: any) => {
        const todosLosEventos = Array.isArray(res) ? res : [];
        
        // 1. Creados reales filtrados por autor
        this.misEventos = todosLosEventos.filter((e: any) => e.authorId === userId);
        this.misEventEventosLength = this.misEventos.length;
        
        // 2. 🌟 FAVORITOS COMPLETAMENTE REALES Y FILTRADOS:
        // Traemos los IDs que guardamos en el Home mediante LocalStorage
        const favoritosGuardadosRaw = localStorage.getItem('ids_favoritos');
        
        if (favoritosGuardadosRaw) {
          const idsFavoritos: string[] = JSON.parse(favoritosGuardadosRaw);
          // SÓLO se muestran los eventos cuyos IDs estén dentro de la lista de favoritos guardados
          this.eventosFavoritos = todosLosEventos.filter((e: any) => idsFavoritos.includes(e.id));
        } else {
          // Si no hay nada en LocalStorage, la pestaña de favoritos aparece totalmente vacía
          this.eventosFavoritos = [];
        }

        // 3. Asistidos se queda limpio en []
        this.eventosAsistidos = [];

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

  guardarCambiosPerfil() {
    if (!this.editNombre.trim() || !this.editCorreo.trim()) {
      alert('El nombre y el correo no pueden estar vacíos');
      return;
    }
    
    this.nombreUsuario = this.editNombre;
    this.fotoPerfil = this.editFoto;
    this.correoUsuario = this.editCorreo;
    this.telefonoUsuario = this.editTelefono;
    
    try {
      localStorage.setItem('perfil_nombre', this.nombreUsuario);
      localStorage.setItem('perfil_foto', this.fotoPerfil);
      localStorage.setItem('perfil_correo', this.correoUsuario);
      localStorage.setItem('perfil_telefono', this.telefonoUsuario);
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }

    this.editando = false; 
    this.cdr.detectChanges(); 
  }
}
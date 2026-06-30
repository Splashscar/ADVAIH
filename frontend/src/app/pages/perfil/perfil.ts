import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

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

  // 🔐 CONTROL DE ACCESO (true = Mi perfil, false = Perfil ajeno)
  esMiPerfil: boolean = true; 

  // Estado e inputs del formulario de edición
  editando: boolean = false;
  editNombre: string = '';
  editFoto: string = '';
  editCorreo: string = '';
  editTelefono: string = '';

  // Contadores dinámicos
  followers: number = 0; 
  seguidos: number = 0;
  siguiendoUsuario: boolean = false;

  // Repositorios de datos reales
  misEventos: any[] = [];
  eventosFavoritos: any[] = [];
  eventosAsistidos: any[] = [];

  tabActiva: 'creados' | 'favoritos' | 'asistidos' = 'creados';
  private subUsuario!: Subscription;

  constructor(
    private authService: AuthServices,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subUsuario = this.authService.usuario$.subscribe(usuario => {
      if (usuario) {
        this.usuario = usuario;
        this.nombreUsuario = usuario.displayName || usuario.email || 'Usuario de ADVAIH';
        this.fotoPerfil = usuario.photoURL || '';
        this.correoUsuario = usuario.email || 'usuario@advaih.com';
        this.telefonoUsuario = usuario.phoneNumber || 'Sin teléfono registrado';
        
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
        this.misEventos = todosLosEventos.filter((e: any) => e.authorId === userId);
        this.eventosFavoritos = todosLosEventos.filter((_, index) => index % 2 === 0).slice(0, 3);
        this.eventosAsistidos = todosLosEventos.filter((_, index) => index % 3 === 1).slice(0, 2);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error procesando métricas:', err)
    });
  }

  simularSeguimiento() {
    this.siguiendoUsuario = !this.siguiendoUsuario;
    this.followers += this.siguiendoUsuario ? 1 : -1;
    this.cdr.detectChanges();
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

  // 📸 LÓGICA PARA LEER EL ARCHIVO SELECCIONADO LOCALMENTE
  onFotoSeleccionada(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      // Crea una URL virtual y temporal del archivo seleccionado de la máquina del usuario
      this.editFoto = URL.createObjectURL(archivo);
      this.cdr.detectChanges();
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
    this.editando = false; 
    this.cdr.detectChanges(); 
  }
}
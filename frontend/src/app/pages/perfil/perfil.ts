import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoleService } from '../../services/role';
import { Subscription } from 'rxjs';
import { FooterComponent } from '../../components/footer/footer';
import { AuthServices } from '../../services/auth';
import { EventosService } from '../../services/eventos';
import { FirebaseService } from '../../services/firebase';
import { Navbar } from '../../components/navbar/navbar';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Navbar,
    FooterComponent
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilComponent implements OnInit, OnDestroy {

  // =========================================================
  // USUARIO
  // =========================================================

  usuario: any = null;

  id_usuario: string = '';

  nombreUsuario: string = 'Usuario ADVAIH';
  correoUsuario: string = 'usuario@advaih.com';
  telefonoUsuario: string = '';
  fotoPerfil: string = '';

  tipoUsuario: string = 'Organizador';
  ciudad: string = 'Bogotá';
  biografia: string =
    'Amante de los festivales de música y los eventos culturales al aire libre.';

  fechaRegistro: string = '';

  // =========================================================
  // ALIAS PARA COMPATIBILIDAD CON OTROS HTML
  // =========================================================

  get nombre(): string {
    return this.nombreUsuario;
  }

  set nombre(valor: string) {
    this.nombreUsuario = valor;
  }

  get correo(): string {
    return this.correoUsuario;
  }

  set correo(valor: string) {
    this.correoUsuario = valor;
  }

  get email(): string {
    return this.correoUsuario;
  }

  set email(valor: string) {
    this.correoUsuario = valor;
  }

  get foto_perfil(): string {
    return this.fotoPerfil;
  }

  set foto_perfil(valor: string) {
    this.fotoPerfil = valor;
  }

  get fotoUrl(): string {
    return this.fotoPerfil;
  }

  set fotoUrl(valor: string) {
    this.fotoPerfil = valor;
  }

  get rol(): string {
    return this.tipoUsuario;
  }

  set rol(valor: string) {
    this.tipoUsuario = valor;
  }

  get tipo_usuario(): string {
    return this.tipoUsuario;
  }

  set tipo_usuario(valor: string) {
    this.tipoUsuario = valor;
  }

  // =========================================================
  // EDICIÓN DEL PERFIL
  // =========================================================

  editando: boolean = false;

  editNombre: string = '';
  editCorreo: string = '';
  editTelefono: string = '';
  editFoto: string = '';
  editCiudad: string = '';
  editBiografia: string = '';
  editTipoUsuario: string = 'Organizador';

  fotoArchivo: File | null = null;

  // =========================================================
  // EVENTOS
  // =========================================================

  misEventos: any[] = [];
  misEventEventosLength: number = 0;

  eventosFavoritos: any[] = [];

  eventosAsistidos: any[] = [];

  tabActiva: 'creados' | 'favoritos' | 'asistidos' = 'creados';

  // =========================================================
  // ESTADO
  // =========================================================

  estaLogueado: boolean = false;

  private subUsuario?: Subscription;

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private authService: AuthServices,
    private eventosService: EventosService,
    private firebaseService: FirebaseService,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService
  ) {}

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {

    console.log(
      '🎭 ROL ACTUAL:',
      this.roleService.obtenerRol()
    );

    this.subUsuario = this.authService.usuario$.subscribe({

      next: (usuario) => {

        if (!usuario) {
          this.estaLogueado = false;
          this.usuario = null;
          return;
        }

        this.usuario = usuario;
        this.estaLogueado = true;
        this.id_usuario = usuario.uid;

        console.log('👤 Usuario autenticado:', usuario.uid);

        // Cargar información REAL desde Firestore
        this.cargarPerfil(usuario.uid);

        // Cargar eventos
        this.procesarMetricasPerfil(usuario.uid);

      },

      error: (error) => {

        console.error(
          '❌ Error obteniendo usuario:',
          error
        );

      }

    });

  }

  // =========================================================
  // DESTRUIR COMPONENTE
  // =========================================================

  ngOnDestroy(): void {

    this.subUsuario?.unsubscribe();

  }

  // =========================================================
  // CARGAR PERFIL DESDE FIRESTORE
  // =========================================================

  cargarPerfil(uid: string): void {

    this.firebaseService
      .obtenerUsuario(uid)
      .subscribe({

        next: (datos: any) => {

          console.log(
            '📥 Perfil recibido desde Firestore:',
            datos
          );

          if (!datos) {

            console.warn(
              '⚠️ No existe información del usuario en Firestore'
            );

            return;

          }

          // =================================================
          // DATOS DEL PERFIL
          // =================================================

          this.nombreUsuario =
            datos.nombre ||
            this.usuario?.displayName ||
            'Usuario ADVAIH';

          this.correoUsuario =
            datos.correo ||
            datos.email ||
            this.usuario?.email ||
            '';

          this.telefonoUsuario =
            datos.telefono ||
            '';

          this.tipoUsuario =
            datos.tipo_usuario ||
            'Organizador';

          this.ciudad =
            datos.ciudad ||
            'Bogotá';

          this.biografia =
            datos.biografia ||
            'Amante de los festivales de música y los eventos culturales al aire libre.';

          this.fotoPerfil =
            datos.foto_perfil ||
            datos.foto_url ||
            this.usuario?.photoURL ||
            '';

          // =================================================
          // FECHA DE REGISTRO
          // =================================================

          if (datos.FechaCreacion) {

            try {

              const fecha =
                datos.FechaCreacion.toDate
                  ? datos.FechaCreacion.toDate()
                  : new Date(datos.FechaCreacion);

              this.fechaRegistro =
                fecha.toLocaleDateString('es-CO');

            } catch {

              this.fechaRegistro = '';

            }

          }

          // =================================================
          // SINCRONIZAR CAMPOS DE EDICIÓN
          // =================================================

          this.editNombre =
            this.nombreUsuario;

          this.editCorreo =
            this.correoUsuario;

          this.editTelefono =
            this.telefonoUsuario;

          this.editFoto =
            this.fotoPerfil;

          this.editCiudad =
            this.ciudad;

          this.editBiografia =
            this.biografia;

          this.editTipoUsuario =
            this.tipoUsuario;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            '❌ Error cargando perfil desde Firestore:',
            error
          );

        }

      });

  }

  // =========================================================
  // CAMBIAR TAB
  // =========================================================

  cambiarTab(
    tab: 'creados' | 'favoritos' | 'asistidos'
  ): void {

    this.tabActiva = tab;

  }

  // =========================================================
  // CARGAR EVENTOS DEL PERFIL
  // =========================================================

  procesarMetricasPerfil(userId: string): void {

    this.eventosService
      .obtenerEventos()
      .subscribe({

        next: (res: any) => {

          const todosLosEventos =
            Array.isArray(res)
              ? res
              : [];

          // =================================================
          // EVENTOS CREADOS
          // =================================================

          this.misEventos =
            todosLosEventos.filter(
              (evento: any) =>
                evento.authorId === userId
            );

          this.misEventEventosLength =
            this.misEventos.length;

          // =================================================
          // FAVORITOS
          // =================================================

          this.eventosFavoritos =
            todosLosEventos.filter(
              (evento: any) =>
                evento.usuariosFavoritos?.includes(userId)
            );

          console.log(
            '⭐ Eventos favoritos del usuario:',
            this.eventosFavoritos
          );

          this.cdr.detectChanges();

          // =================================================
          // ASISTIDOS
          // =================================================

          this.eventosAsistidos = [];

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            '❌ Error obteniendo eventos:',
            error
          );

        }

      });

  }

  // =========================================================
  // ACTIVAR / DESACTIVAR EDICIÓN
  // =========================================================

  alternarEdicion(): void {

    this.editando =
      !this.editando;

    if (this.editando) {

      this.editNombre =
        this.nombreUsuario;

      this.editCorreo =
        this.correoUsuario;

      this.editTelefono =
        this.telefonoUsuario;

      this.editFoto =
        this.fotoPerfil;

      this.editCiudad =
        this.ciudad;

      this.editBiografia =
        this.biografia;

      this.editTipoUsuario =
        this.tipoUsuario;

    }

  }

  // =========================================================
  // SELECCIONAR FOTO
  // =========================================================

  onFotoSeleccionada(event: any): void {

    if (!this.estaLogueado) {
      return;
    }

    const archivo =
      event.target.files?.[0];

    if (!archivo) {
      return;
    }

    this.fotoArchivo =
      archivo;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.editFoto =
        reader.result as string;

      this.cdr.detectChanges();

    };

    reader.readAsDataURL(archivo);

  }

  // =========================================================
  // GUARDAR CAMBIOS
  // =========================================================

  async guardarCambios(): Promise<void> {

    if (!this.estaLogueado) {

      console.warn(
        'No hay usuario autenticado'
      );

      return;

    }

    if (!this.id_usuario) {

      console.error(
        'No existe UID del usuario'
      );

      return;

    }

    // =================================================
    // VALIDACIONES
    // =================================================

    if (!this.editNombre.trim()) {

      alert(
        'El nombre no puede estar vacío'
      );

      return;

    }

    if (!this.editCorreo.trim()) {

      alert(
        'El correo no puede estar vacío'
      );

      return;

    }

    // =================================================
    // DATOS A GUARDAR
    // =================================================

    const datosActualizados = {

      nombre:
        this.editNombre.trim(),

      correo:
        this.editCorreo.trim(),

      tipo_usuario:
        this.editTipoUsuario,

      telefono:
        this.editTelefono.trim(),

      ciudad:
        this.editCiudad.trim(),

      biografia:
        this.editBiografia.trim(),

      foto_perfil:
        this.editFoto

    };

    console.log(
      'UID:',
      this.id_usuario
    );

    console.log(
      'Datos a guardar:',
      datosActualizados
    );

    try {

      // =================================================
      // GUARDAR DIRECTAMENTE EN FIRESTORE
      // =================================================

      await this.firebaseService.actualizarPerfil(
        this.id_usuario,
        datosActualizados
      );

      console.log(
        'Perfil actualizado correctamente en Firestore'
      );

      // =================================================
      // ACTUALIZAR LA VISTA INMEDIATAMENTE
      // =================================================

      this.nombreUsuario =
        datosActualizados.nombre;

      this.correoUsuario =
        datosActualizados.correo;

      this.tipoUsuario =
        datosActualizados.tipo_usuario;

      this.telefonoUsuario =
        datosActualizados.telefono;

      this.ciudad =
        datosActualizados.ciudad;

      this.biografia =
        datosActualizados.biografia;

      this.fotoPerfil =
        datosActualizados.foto_perfil;

      this.editando = false;

      this.cdr.detectChanges();

      console.log(
        'Vista del perfil actualizada'
      );

    } catch (error) {

      console.error(
        'Error actualizando perfil:',
        error
      );

      alert(
        'No se pudieron guardar los cambios del perfil.'
      );

    }

  }

}
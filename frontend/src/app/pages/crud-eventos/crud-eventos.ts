import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../../services/eventos';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { AuthServices } from '../../services/auth';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-crud-eventos',
  standalone: true,
  imports: [FormsModule, CommonModule, Navbar, FooterComponent],
  templateUrl: './crud-eventos.html',
  styleUrl: './crud-eventos.css',
})
export class CrudEventos implements OnInit {

  title = '';
  description = '';
  date = '';
  time = '';

  // Ubicación que finalmente se guardará
  location = '';

  // Ubicación seleccionada en el formulario
  ubicacionSeleccionada = '';

  // Texto cuando se selecciona "Otra ubicación"
  ubicacionPersonalizada = '';

  category = '';

  usuario: any = null;

  selectedFile: File | null = null;
  previewImage: string | null = null;

  eventos: any[] = [];

  eventoEditandoId = '';

  cargando = false;

  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef,
    private authService: AuthServices
  ) {}

  ngOnInit(): void {

  this.authService.usuario$.subscribe(usuario => {

    this.usuario = usuario;

    console.log('Usuario:', usuario);

    if (this.usuario?.uid) {
      this.cargarEventos();
    }

  });

}


  // ==========================================
  // GUARDAR EVENTO
  // ==========================================

  guardarEvento(): void {

    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;

    if (this.eventoEditandoId) {

      this.actualizarEvento();

    } else {

      this.crearEvento();

    }
  }


  // ==========================================
  // VALIDACIONES
  // ==========================================

  validarFormulario(): boolean {

    if (!this.title.trim()) {

      alert('⚠️ El nombre del evento es obligatorio.');
      return false;

    }

    if (!this.description.trim()) {

      alert('⚠️ La descripción del evento es obligatoria.');
      return false;

    }

    if (!this.date) {

      alert('⚠️ Selecciona una fecha.');
      return false;

    }

    if (!this.time) {

      alert('⚠️ Selecciona una hora.');
      return false;

    }

    const ubicacion = this.obtenerUbicacionFinal();

    if (!ubicacion) {

      alert('⚠️ Selecciona o escribe una ubicación.');
      return false;

    }

    if (!this.category) {

      alert('⚠️ Selecciona una categoría.');
      return false;

    }

    // Imagen obligatoria únicamente al crear
    if (!this.eventoEditandoId && !this.selectedFile) {

      alert('⚠️ Selecciona una imagen para el evento.');
      return false;

    }

    return true;
  }


  // ==========================================
  // OBTENER UBICACIÓN FINAL
  // ==========================================

  obtenerUbicacionFinal(): string {
  return this.location.trim();
}


  // ==========================================
  // CREAR EVENTO
  // ==========================================

  crearEvento(): void {

    if (!this.selectedFile) {

      this.cargando = false;

      alert('⚠️ Selecciona una imagen.');

      return;
    }

    const formData = new FormData();

    formData.append('image', this.selectedFile);

    console.log('📤 Subiendo imagen...');

    this.eventosService
      .subirImagen(formData)
      .subscribe({

        next: (respuesta: any) => {

          console.log('✅ Imagen subida:', respuesta);

          const ubicacionFinal =
            this.obtenerUbicacionFinal();

          const evento = {

            title: this.title.trim(),

            description: this.description.trim(),

            date: this.date,

            time: this.time,

            location: ubicacionFinal,

            category: this.category,

            imageUrl: respuesta.url,

            authorId:
              this.usuario?.uid || '',

            authorName:
              this.usuario?.displayName ||
              this.usuario?.email ||
              'Usuario',

            authorEmail:
              this.usuario?.email || '',

            authorPhoto:
              this.usuario?.photoURL || '',

            likes: 0,

            usuariosLike: [],

            favoritos: 0,

            usuariosFavoritos: []

          };

          console.log(
            '📤 Enviando evento:',
            evento
          );

          this.eventosService
            .crearEvento(evento)
            .subscribe({

              next: (res) => {

                console.log(
                  '✅ Evento creado:',
                  res
                );

                alert(
                  '✅ Evento creado correctamente.'
                );

                this.cargarEventos();

                this.limpiarFormulario();

              },

              error: (err) => {

                console.error(
                  '❌ Error creando evento:',
                  err
                );

                console.error(
                  'Respuesta:',
                  err.error
                );

                this.cargando = false;

                alert(
                  '❌ No se pudo crear el evento.'
                );

              }

            });

        },

        error: (err) => {

          console.error(
            '❌ Error subiendo imagen:',
            err
          );

          console.error(
            'Respuesta:',
            err.error
          );

          this.cargando = false;

          alert(
            '❌ No se pudo subir la imagen.'
          );

        }

      });
  }


  // ==========================================
  // EDITAR EVENTO
  // ==========================================

  editarEvento(evento: any): void {

    console.log(
      '✏️ Editando evento:',
      evento
    );

    this.eventoEditandoId = evento.id;

    this.title =
      evento.title || '';

    this.description =
      evento.description || '';

    this.date =
      evento.date || '';

    this.time =
      evento.time || '';

    this.category =
      evento.category || '';

    // Restaurar ubicación
    this.location =
      evento.location || '';

    // Imagen actual
    this.previewImage =
      evento.imageUrl || null;

    // La imagen actual NO es un File
    this.selectedFile = null;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

  }


  // ==========================================
  // ACTUALIZAR EVENTO
  // ==========================================

  actualizarEvento(): void {

    const actualizarDatos = (
      imageUrl?: string
    ) => {

      const evento: any = {

        title: this.title.trim(),

        description:
          this.description.trim(),

        date: this.date,

        time: this.time,

        location:
          this.obtenerUbicacionFinal(),

        category:
          this.category

      };

      if (imageUrl) {

        evento.imageUrl =
          imageUrl;

      }

      console.log(
        '📤 Actualizando evento:',
        evento
      );

      this.eventosService
        .actualizarEvento(
          this.eventoEditandoId,
          evento
        )
        .subscribe({

          next: (res) => {

            console.log(
              '✅ Evento actualizado:',
              res
            );

            alert(
              '✅ Evento actualizado correctamente.'
            );

            this.cargarEventos();

            this.limpiarFormulario();

          },

          error: (err) => {

            console.error(
              '❌ Error actualizando:',
              err
            );

            this.cargando = false;

            alert(
              '❌ No se pudo actualizar el evento.'
            );

          }

        });

    };


    // Si se seleccionó una nueva imagen
    if (this.selectedFile) {

      const formData =
        new FormData();

      formData.append(
        'image',
        this.selectedFile
      );

      console.log(
        '📤 Subiendo nueva imagen...'
      );

      this.eventosService
        .subirImagen(formData)
        .subscribe({

          next: (respuesta: any) => {

            console.log(
              '✅ Nueva imagen:',
              respuesta.url
            );

            actualizarDatos(
              respuesta.url
            );

          },

          error: (err) => {

            console.error(
              '❌ Error subiendo nueva imagen:',
              err
            );

            this.cargando = false;

            alert(
              '❌ No se pudo subir la nueva imagen.'
            );

          }

        });

    } else {

      // No cambió la imagen
      actualizarDatos();

    }

  }


  // ==========================================
  // ELIMINAR
  // ==========================================

  eliminarEvento(id: string): void {

    if (!confirm(
      '¿Estás seguro de eliminar este evento?'
    )) {

      return;
    }

    this.eventosService
      .eliminarEvento(id)
      .subscribe({

        next: () => {

          alert(
            '✅ Evento eliminado correctamente.'
          );

          this.cargarEventos();

        },

        error: (err) => {

          console.error(
            '❌ Error eliminando:',
            err
          );

          alert(
            '❌ No se pudo eliminar el evento.'
          );

        }

      });

  }


  // ==========================================
  // CARGAR EVENTOS
  // ==========================================

  cargarEventos(): void {

  this.eventosService
    .obtenerEventos()
    .subscribe({

      next: (data: any) => {

        console.log('📥 Todos los eventos:', data);

        const todosLosEventos =
          Array.isArray(data)
            ? data
            : [];

        // Mostrar solamente los eventos creados
        // por el usuario actualmente autenticado
        this.eventos =
          todosLosEventos.filter(
            (evento: any) =>
              evento.authorId === this.usuario?.uid
          );

        console.log(
          '👤 Mis eventos:',
          this.eventos
        );

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(
          '❌ Error cargando eventos:',
          err
        );

      }

    });

}


  // ==========================================
  // IMAGEN
  // ==========================================

  onFileSelected(event: any): void {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {

      alert(
        '⚠️ Solo puedes seleccionar imágenes.'
      );

      event.target.value = '';

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        '⚠️ La imagen no puede superar los 5 MB.'
      );

      event.target.value = '';

      return;
    }

    this.selectedFile = file;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.previewImage =
        reader.result as string;

      this.cdr.detectChanges();

    };

    reader.readAsDataURL(file);

  }


  // ==========================================
  // LIMPIAR FORMULARIO
  // ==========================================

  limpiarFormulario(): void {

    this.eventoEditandoId = '';

    this.title = '';

    this.description = '';

    this.date = '';

    this.time = '';

    this.location = '';

    this.ubicacionSeleccionada = '';

    this.ubicacionPersonalizada = '';

    this.category = '';

    this.selectedFile = null;

    this.previewImage = null;

    this.cargando = false;

  }

}
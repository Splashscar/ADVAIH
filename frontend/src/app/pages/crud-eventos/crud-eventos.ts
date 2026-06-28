import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EventosService } from '../../services/eventos';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-crud-eventos',
  standalone: true,
  imports: [FormsModule,CommonModule,Navbar],
  templateUrl: './crud-eventos.html',
  styleUrl: './crud-eventos.css',
})
export class CrudEventos implements OnInit {
  title = '';
  description = '';
  date = '';
  time = '';
  location = '';
  category = '';
selectedFile: File | null = null;
previewImage: string | null = null; 
  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

crearEvento() {

  if (!this.selectedFile) {

    alert('Selecciona una imagen');

    return;

  }

  const formData = new FormData();

  formData.append('image', this.selectedFile);

  this.eventosService
    .subirImagen(formData)
    .subscribe({

      next: (respuesta: any) => {

        console.log('URL Cloudinary:', respuesta.url);

        const evento = {

          title: this.title,
          description: this.description,
          date: this.date,
          time: this.time,
          location: this.location,
          category: this.category,

          imageUrl: respuesta.url

        };

        this.eventosService
          .crearEvento(evento)
          .subscribe({

            next: (res) => {

              console.log('Evento creado', res);

              this.cargarEventos();

              this.limpiarFormulario();

            },

            error: (err) => {

              console.error(err);

            }

          });

      },

      error: (err) => {

        console.error(err);

      }

    });

}
eventos: any[] = [];

ngOnInit() {

  this.cargarEventos();



  this.eventosService.obtenerEventos()
    .subscribe({
      next: (data: any) => {

        this.eventos = data;
        this.cdr.detectChanges();
        this.cargarEventos();
        

        console.log(data);

      },
      error: (err) => {

        console.error(err);

      }
    });

}
  eliminarEvento(id: string) {

    if (!confirm('¿Eliminar evento?')) {
      return;
    }

    this.eventosService
      .eliminarEvento(id)
      .subscribe({
        next: () => {
          
          this.cargarEventos();
        },

        error: (err) => {
          console.error(err);
        }
      });

  

}
eventoEditandoId = '';
editarEvento(evento: any) {

  this.eventoEditandoId = evento.id;

  this.title = evento.title;
  this.description = evento.description;
  this.date = evento.date;
  this.time = evento.time || '';
  this.location = evento.location;
  this.category = evento.category;

  this.cargarEventos();

}
actualizarEvento() {

  const evento = {
    title: this.title,
    description: this.description,
    date: this.date,
    time: this.time,
    location: this.location,
    category: this.category

    
  };

  this.eventosService
    .actualizarEvento(
      this.eventoEditandoId,
      evento
    )
    .subscribe({

      next: (res) => {

        console.log('Evento actualizado', res);

        this.cargarEventos();

        this.limpiarFormulario();

      },

      error: (err) => {

        console.error(err);

      }

    });

} 
cargarEventos() {

  this.eventosService.obtenerEventos()
    .subscribe({

      next: (data: any) => {

        this.eventos = data;
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(err);

      }

    });

}

limpiarFormulario() {

  this.eventoEditandoId = '';

  this.title = '';
  this.description = '';
  this.date = '';
  this.time = '';
  this.location = '';
  this.category = '';

  this.selectedFile = null;
  this.previewImage = null;

}

  nombreUsuario = 'David';

  cerrarSesion() {
    console.log('Cerrar sesión');
  }
  onFileSelected(event: any) {

  const file = event.target.files[0];

  if (!file) return;

  this.selectedFile = file;

  const reader = new FileReader();

  reader.onload = () => {
    this.previewImage = reader.result as string;
  };

  reader.readAsDataURL(file);

}
}
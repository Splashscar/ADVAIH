import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { FirebaseService } from '../../services/firebase';
import { AuthServices } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, FooterComponent],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {

  cargando: boolean = true;
  usuarios: any[] = [];

  rolesDisponibles: string[] = ['usuario', 'organizador', 'administrador'];

  guardandoUid: string | null = null;

  mensajeError: string = '';

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthServices,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.firebaseService.obtenerUsuarios().subscribe({

      next: (res: any[]) => {

        this.usuarios = res.map(u => ({
          ...u,
          rolSeleccionado: (u.tipo_usuario || 'usuario').toLowerCase().trim()
        }));

        this.cargando = false;
        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error('❌ Error cargando usuarios:', err);
        this.cargando = false;

      }

    });

  }

  async guardarRol(usuario: any): Promise<void> {

    this.mensajeError = '';
    this.guardandoUid = usuario.uid;

    const usuarioActual = this.authService.obtenerUsuario();

    if (!usuarioActual) {
      this.mensajeError = 'Debes iniciar sesión.';
      this.guardandoUid = null;
      return;
    }

    try {

      const token = await usuarioActual.getIdToken();

      await this.http.patch(
        `${environment.apiUrl}/admin/usuarios/${usuario.uid}/rol/`,
        { rol: usuario.rolSeleccionado },
        { headers: { Authorization: `Bearer ${token}` } }
      ).toPromise();

      usuario.tipo_usuario = usuario.rolSeleccionado;

    } catch (error: any) {

      console.error('❌ Error cambiando rol:', error);

      this.mensajeError =
        error?.error?.error ||
        'No se pudo cambiar el rol. Intenta de nuevo.';

    } finally {

      this.guardandoUid = null;
      this.cdr.detectChanges();

    }

  }

}
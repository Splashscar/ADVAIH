import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Navbar } from '../../components/navbar/navbar';

import { FirebaseService } from '../../services/firebase';
import { AuthServices } from '../../services/auth';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [
    CommonModule,
    Navbar
  ],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent implements OnInit {

  favoritos: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthServices,
    // 1. Inyectamos ChangeDetectorRef para forzar el renderizado del HTML
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.authService.usuario$
      .subscribe(usuario => {
        if (!usuario) return;

        console.log("👤 Usuario:", usuario.uid);

        this.firebaseService
          .obtenerFavoritos(usuario.uid)
          .subscribe((docs: any[]) => {
            console.log("⭐ Favoritos:", docs);

            this.favoritos = [];

            docs.forEach(favorito => {
              console.log("🔎 Buscando evento:", favorito.eventoId);

              this.firebaseService
                .obtenerEvento(favorito.eventoId)
                .subscribe({
                  next: (evento: any) => {
                    console.log("✅ Evento encontrado:", evento);

                    if (evento) {
                      // 2. Reasignamos el arreglo completo para ayudar a la reactividad de Angular
                      this.favoritos = [...this.favoritos, evento];
                      console.log("ARRAY FAVORITOS", this.favoritos);

                      // 3. LA MAGIA: Obligamos a Angular a actualizar la vista inmediatamente
                      this.cdr.detectChanges(); 
                    }
                  },
                  error: (err) => {
                    console.error("❌ Error obteniendo evento:", err);
                  }
                });
            });
          });
      });
  }
}
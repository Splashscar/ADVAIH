import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { EventosService } from '../../services/eventos';
import { JsonPipe } from '@angular/common';

imports: [
  CommonModule,
  JsonPipe,
  NavbarComponent,
  FooterComponent
]

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  eventos: any[] = [];

  constructor(private eventosService: EventosService) {}

  ngOnInit(): void {

    console.log("HOME INICIADO");

    this.eventosService.obtenerEventos()
      .subscribe({
        next: (data: any) => {
          console.log("EVENTOS:", data);
          this.eventos = data;
        },
        error: (error) => {
          console.error("ERROR:", error);
        }
      });

  }
  

}


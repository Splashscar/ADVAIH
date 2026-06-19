import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { EventosService } from '../../services/eventos';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  nombre = '';
  email = '';
  password = '';

  constructor(
    private eventosService: EventosService,
    private router: Router
  ) { }

  registrar() {

    this.eventosService.register({
      nombre: this.nombre,
      email: this.email,
      password: this.password
    })
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.router.navigate(['/']);
        },
        error: (err: any) => {
          console.error(err);
        }
      });

  }

}
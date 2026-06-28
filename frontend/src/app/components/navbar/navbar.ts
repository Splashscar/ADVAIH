import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthServices } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  nombreUsuario = '';

  constructor(
    private authService: AuthServices,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.authService.usuario$
      .subscribe(usuario => {

        if (usuario) {

          this.nombreUsuario =
            usuario.displayName ||
            usuario.email ||
            'Usuario';

        }

      });

  }

  async cerrarSesion() {

    try {

      await this.authService.cerrarSesion();

      this.router.navigate(['/']);

    } catch (error) {

      console.error(error);

    }

  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthServices } from '../../services/auth';
import { RoleService } from '../../services/role';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  nombreUsuario = '';

  constructor(
    private authService: AuthServices,
    public roleService: RoleService,
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
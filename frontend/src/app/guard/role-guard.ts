import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { RoleService, RolUsuario } from '../services/role';

@Injectable({
  providedIn: 'root',
})
export class roleGuard implements CanActivate {

  private roleService = inject(RoleService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {

    const rolesPermitidos = route.data['roles'] as RolUsuario[];

    return this.roleService.rol$.pipe(
      take(1),
      map(rolActual => {

        if (!rolesPermitidos || rolesPermitidos.includes(rolActual)) {
          console.log('✅ Acceso permitido, rol:', rolActual);
          return true;
        }

        console.log(
          '⛔ Acceso denegado. Rol actual:', rolActual,
          '| Roles requeridos:', rolesPermitidos
        );

        this.router.navigate(['/']);
        return false;

      })
    );

  }

}
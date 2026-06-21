import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthServices } from '../services/auth';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})

export class authGuard implements CanActivate{

  private authService = inject(AuthServices)
  private router = inject(Router)

  canActivate(): Observable<boolean> {
    return this.authService.estaAutenticado$.pipe(
      tap(estaAutenticado =>{
        if(!estaAutenticado){
          console.log("Error acceso denegado")
          this.router.navigate(['/auth'])
        }else{
          console.log("Acceso permitido")
        }
      }

      ),
      map(estaAutenticado => estaAutenticado)
    )
    
  }


};




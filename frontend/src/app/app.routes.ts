import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { CrudEventos } from "./pages/crud-eventos/crud-eventos"
import { PerfilComponent } from './pages/perfil/perfil';
import { authGuard } from './guard/auth-guard.ts-guard';
import { FavoritosComponent } from './pages/favoritos/favoritos';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard]
  },

  {
    path: 'crud-eventos',
    component: CrudEventos,
    canActivate: [authGuard]
  },

  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  {
    path: 'favoritos',
    component: FavoritosComponent
  },
];
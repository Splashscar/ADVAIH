import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { HomeComponent } from './pages/home/home';
import { CrudEventos } from "./pages/crud-eventos/crud-eventos"
import { PerfilComponent } from './pages/perfil/perfil';
import { authGuard } from './guard/auth-guard.ts-guard';
import { ChatsComponent } from './pages/chats/chats';
import { ChatConversacion } from './pages/chat-conversacion/chat-conversacion';
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
  path: 'chats',
  component: ChatsComponent
},
{
  path: 'chats/:chatId',
  loadComponent: () =>
    import('./pages/chat-conversacion/chat-conversacion')
      .then(m => m.ChatConversacion)
}

];
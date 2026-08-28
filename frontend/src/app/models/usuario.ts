export interface Usuario {
  uid: string;
  nombre: string;
  email: string;

  fotoURL?: string;

  tipo_usuario?: 'usuario' | 'organizador';

  descripcion?: string;

  FechaCreacion?: any;
  ultimaconexion?: any;
}
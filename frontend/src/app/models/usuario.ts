export interface Usuario {
  uid: string;
  nombre: string;
  email: string;

  fotoURL?: string;

  tipo_usuario?: 'usuario' | 'colaborador';

  descripcion?: string;

  FechaCreacion?: any;
  ultimaconexion?: any;
}
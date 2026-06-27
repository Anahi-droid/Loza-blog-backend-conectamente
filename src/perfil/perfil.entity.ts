// Perfil no tiene tabla propia; opera directamente sobre la entidad Usuario.
// Este archivo puede reexportar el tipo del usuario autenticado inyectado por el Guard.

export interface UsuarioAutenticado {
  id: string;
  email: string;
  rol: string;
}
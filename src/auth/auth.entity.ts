// Auth no tiene tabla propia.
// Este archivo puede exportar los tipos del payload JWT.

export interface JwtPayload {
  sub: string; // id del usuario (UUID)
  rol: string;
  email: string;
}
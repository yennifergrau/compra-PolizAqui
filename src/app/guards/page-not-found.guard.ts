import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const authSession = localStorage.getItem('auth-session');

    if (authSession) {
      const session = JSON.parse(authSession);
      const token = session?.token;

      if (token && !this.isTokenExpired(token)) {
        return true;
      }
    }

    this.router.navigate(['/']);
    return false;
  }

  /**
   * Verifica si el token JWT ha expirado.
   * @param token El token JWT.
   * @returns `true` si el token ha expirado, `false` si es válido.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000); 
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar la expiración del token:', error);
      return true; 
    }
  }
}

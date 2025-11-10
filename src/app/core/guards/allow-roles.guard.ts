import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const allowRolesGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);
    const auth   = inject(AuthService);
    const user   = auth.currentUser;
    console.log('allowRolesGuard', user, route.data);
    // Debe estar autenticado
    if (!user) { router.navigateByUrl('/login'); return false; }

    // Roles permitidos (si no hay, basta con estar logueado)
    const allowed: string[] | undefined = route.data?.['roles'];
    if (!allowed || allowed.length === 0) return true;

    if (allowed.includes(user.rol)) return true;

    // Sin permiso → redirige a una segura
    router.navigateByUrl('/home');
    return false;
};

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const router = inject(Router);
    const auth = inject(AuthService);
    const user = auth.currentUser;
    if (user?.rol === 'ADMIN') return true;

    router.navigateByUrl('/home'); // o a una página de “acceso denegado”
    return false;
};

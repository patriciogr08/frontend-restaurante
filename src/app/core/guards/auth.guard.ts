import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    if (auth.isLoggedIn()) return true;
    inject(Router).navigateByUrl('/login');
    return false;
};

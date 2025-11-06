// src/app/core/guards/role.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const RoleGuard = (roles: string[]): CanActivateFn => () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser;
    if (user && roles.includes(user.rol)) return true;
    router.navigateByUrl('/login');
    return false;
};

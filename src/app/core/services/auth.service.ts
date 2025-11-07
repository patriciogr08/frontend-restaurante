import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/auth.models';
import { environment } from 'src/environments/environment';
import { Rol } from '../models/users.models';

const { TOKEN_KEY, USER_KEY } = environment.storage;


@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    login(payload: { usuario: string; password: string }) {
        return this.http.post<LoginResponse>('/auth/login', payload);
    }

    setSession(resp: LoginResponse) {
        localStorage.setItem(TOKEN_KEY, resp.token);
        localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
    }

    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        this.router.navigateByUrl('/login', { replaceUrl: true });
    }

    get token(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    get currentUser() {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    isLoggedIn(): boolean {
        return !!this.token;
    }

    get role(): Rol | null {
        return this.currentUser?.rol ?? null;
    }


}

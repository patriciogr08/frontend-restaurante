// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private toast = inject(ToastController);

    get<T>(url: string, params?: Record<string, any>) {
        const p = params ? new HttpParams({ fromObject: params }) : undefined;
        return this.http.get<T>(url, { params: p });
    }

    post<T>(url: string, body: any) {
        return this.http.post<T>(url, body);
    }

}

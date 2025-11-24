import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AdminDashboardResponse } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private http = inject(HttpClient);
  private baseUrl = `/admin/dashboard`;

  getDashboard(opts?: { fecha?: string; desde?: string; hasta?: string }): Observable<AdminDashboardResponse> {
    let params = new HttpParams();

    if (opts?.fecha) {
        params = params.set('fecha', opts.fecha);
    }
    if (opts?.desde) {
        params = params.set('desde', opts.desde);
    }
    if (opts?.hasta) {
        params = params.set('hasta', opts.hasta);
    }

    return this.http.get<AdminDashboardResponse>(this.baseUrl, { params });
  }
}

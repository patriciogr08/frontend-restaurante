import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteVentasResponse } from '../models/reportes.models';

@Injectable({ providedIn: 'root' })
export class AdminReportesService {
    private baseUrl = `/admin/reportes`;

    constructor(private http: HttpClient) {}

    getVentas(params: { desde?: string; hasta?: string; metodoPago?: string }): Observable<ReporteVentasResponse> {
        let httpParams = new HttpParams();
        if (params.desde) httpParams = httpParams.set('desde', params.desde);
        if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
        if (params.metodoPago) httpParams = httpParams.set('metodoPago', params.metodoPago);

        return this.http.get<ReporteVentasResponse>(`${this.baseUrl}/ventas`, {
        params: httpParams,
        });
    }

    getProductos(params: { desde?: string; hasta?: string;}): Observable<ReporteVentasResponse> {
        let httpParams = new HttpParams();
        if (params.desde) httpParams = httpParams.set('desde', params.desde);
        if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);

        return this.http.get<ReporteVentasResponse>(`${this.baseUrl}/productos`, {
        params: httpParams,
        });
    }

    
    getMeseros(params: { desde?: string; hasta?: string;}): Observable<ReporteVentasResponse> {
        let httpParams = new HttpParams();
        if (params.desde) httpParams = httpParams.set('desde', params.desde);
        if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);

        return this.http.get<ReporteVentasResponse>(`${this.baseUrl}/meseros`, {
        params: httpParams,
        });
    }

    descargarVentasExcel(params: {
        desde?: string;
        hasta?: string;
        metodoPago?: string;
        }): Observable<Blob> 
    {
        let httpParams = new HttpParams();
        if (params.desde) httpParams = httpParams.set('desde', params.desde);
        if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);
        if (params.metodoPago) httpParams = httpParams.set('metodoPago', params.metodoPago);

        return this.http.get(`${this.baseUrl}/ventas/export-excel`, {
            params: httpParams,
            responseType: 'blob',
        });
    }

    descargarProductosExcel(params: {
        desde?: string;
        hasta?: string;
        }): Observable<Blob> 
    {
        let httpParams = new HttpParams();
        if (params.desde) httpParams = httpParams.set('desde', params.desde);
        if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);

        return this.http.get(`${this.baseUrl}/productos/export-excel`, {
            params: httpParams,
            responseType: 'blob',
        });
    }

    descargarMeseroExcel(params: {
        desde?: string;
        hasta?: string;
        }): Observable<Blob> 
    {
        let httpParams = new HttpParams();
        if (params.desde) httpParams = httpParams.set('desde', params.desde);
        if (params.hasta) httpParams = httpParams.set('hasta', params.hasta);

        return this.http.get(`${this.baseUrl}/meseros/export-excel`, {
            params: httpParams,
            responseType: 'blob',
        });
    }
}

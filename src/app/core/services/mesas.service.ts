import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Mesa } from '../models/mesas.models';


@Injectable({ providedIn: 'root' })
export class MesasService {
    private http = inject(HttpClient);

    list(includeDeleted = false) {
        const qs = includeDeleted ? '?includeDeleted=1' : '';
        return this.http.get<Mesa[]>(`/mesas${qs}`);
    }

    create(payload: { numero:number; capacidad:number }) {
        return this.http.post<Mesa>('/mesas', payload);
    }

    update(id:number, payload: Partial<{ numero:number; capacidad:number }>) {
        return this.http.patch<Mesa>(`/mesas/${id}`, payload);
    }

    remove(id:number) {
        return this.http.delete<{ok:true}>(`/mesas/${id}`);
    }

    restore(id:number) {
        return this.http.patch<Mesa>(`/mesas/${id}/restore`, {});
    }
}

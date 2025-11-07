import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto, TipoProducto } from '../models/products.models';
import { Estado } from '../models/estado.models';


@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  // Tipos
  listTipos() { 
    return this.http.get<TipoProducto[]>('/tipos-producto'); 
  }

  createTipo(payload: { nombre:string }) { 
    return this.http.post<TipoProducto>('/tipos-producto', payload); 
  }
  
  updateTipo(id:number, payload: Partial<{ nombre:string; estado:Estado }>) {
    return this.http.patch<TipoProducto>(`/tipos-producto/${id}`, payload);
  }
  setEstadoTipo(id:number, estado:Estado) {
    return this.http.patch<{id:number; estado:Estado}>(`/tipos-producto/${id}/estado`, { estado });
  }

  // Productos
  listProductos(params?: { estado?:Estado; tipo?:number }) {
    const qs = new URLSearchParams();
    if (params?.estado) qs.set('estado', params.estado);
    if (params?.tipo)   qs.set('tipo', String(params.tipo));
    const url = `/productos${qs.toString() ? '?' + qs.toString() : ''}`;
    return this.http.get<Producto[]>(url);
  }
  createProducto(payload: {
    tipoProductoId:number; nombre:string; descripcion?:string|null; precio:number;
    tieneDescuento?:boolean; descuentoPorcentaje?:number; descuentoValor?:number;
  }) {
    return this.http.post<Producto>('/productos', payload);
  }

  updateProducto(id:number, payload: Partial<{
    tipoProductoId:number; nombre:string; descripcion:string|null; precio:number;
    tieneDescuento:boolean; descuentoPorcentaje:number; descuentoValor:number; estado:Estado;
  }>) {
    return this.http.patch<Producto>(`/productos/${id}`, payload);
  }

  setEstadoProducto(id:number, estado:Estado) {
    return this.http.patch<{id:number; estado:Estado}>(`/productos/${id}/estado`, { estado });
  }
}

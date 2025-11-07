import { Estado } from "./estado.models";

export interface TipoProducto { 
  id:number; 
  nombre:string; 
  estado:Estado; 
  createdAt:string; 
  updatedAt?:string; 
}

export interface Producto {
  id:number; 
  nombre:string; 
  descripcion:string|null; 
  precio:number; 
  estado:Estado;
  tieneDescuento:boolean; 
  descuentoPorcentaje:number; 
  descuentoValor:number;
  tipoProducto: { id:number; nombre:string };
  createdAt:string; 
  updatedAt?:string;

  ivaPercent: number;             // IVA vigente
  pvpReal: number;                // con IVA, SIN descuento
  pvp: number;  
}

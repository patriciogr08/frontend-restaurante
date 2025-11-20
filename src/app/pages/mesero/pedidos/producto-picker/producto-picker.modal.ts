// src/app/shared/modals/producto-picker.modal.ts
import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from 'src/app/core/services/products.service';
import { Producto } from 'src/app/core/models/products.models';

@Component({
  standalone: true,
  selector: 'app-producto-picker-modal',
  templateUrl: './producto-picker.modal.html',
  styleUrls: ['./producto-picker.modal.scss'],
  imports: [CommonModule, IonicModule],
})
export class ProductoPickerModal implements OnInit {
    private productosSrv = inject(ProductsService);
    private modalCtrl     = inject(ModalController);
    private toastCtrl     = inject(ToastController);

    @Input() tipo?: number; // por si quieres filtrar por tipo

    term = '';
    loading = false;
    productos: Producto[] = [];

    async ngOnInit() {
        // opcional: no cargar nada al inicio y esperar que escriban
        this.onBuscar();
    }

    async onBuscar(ev?: any) {
        const valor = ev?.detail?.value ?? this.term;
        this.loading = true;
        try {
        this.productos = await firstValueFrom(
            this.productosSrv.listProductos({
            estado: 'ACTIVO' as any,
            tipo: this.tipo,
            q: this.term.trim(),
            })
        );
        } catch {
        const t = await this.toastCtrl.create({
            message: 'Error al buscar productos',
            duration: 2000,
            color: 'danger',
        });
        t.present();
        } finally {
        this.loading = false;
        }
    }

    cerrar() {
        this.modalCtrl.dismiss(null, 'cancel');
    }

    seleccionar(prod: Producto) {
        this.modalCtrl.dismiss({ producto: prod }, 'ok');
    }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { ProductsService } from 'src/app/core/services/products.service';
import { Producto, TipoProducto } from 'src/app/core/models/products.models';
import { Estado } from 'src/app/core/models/estado.models';

import { ProductoFormModalComponent } from './producto-form/producto-form.modal';
import { TipoFormModalComponent } from './tipo-form/tipo-form.modal';

@Component({
    standalone: true,
    selector: 'app-productos',
    imports: [CommonModule, IonicModule, ReactiveFormsModule],
    templateUrl: './productos.page.html',
    styleUrls: ['./productos.page.scss']
})
export class ProductosPage {
    private svc   = inject(ProductsService);
    private fb    = inject(FormBuilder);
    private modal = inject(ModalController);
    private toast = inject(ToastController);

    loading = signal(false);
    tipos   = signal<TipoProducto[]>([]);
    rows    = signal<Producto[]>([]);

    filters = this.fb.group({
        tipo: [''],
        estado: [''],
        q: ['']
    });

    ionViewWillEnter() { this.init(); }

    init() {
        this.loading.set(true);
        this.svc.listTipos().subscribe(t => this.tipos.set(t));
        this.load();
        this.filters.valueChanges.subscribe(() => this.load());
    }

    load() {
        const f = this.filters.getRawValue();
        this.svc.listProductos({
        estado: (f.estado || '') as Estado || undefined,
        tipo: f.tipo ? Number(f.tipo) : undefined
        }).subscribe({
        next: (rows) => {
            const q = (this.filters.value.q || '').toLowerCase();
            this.rows.set(q ? rows.filter(r => r.nombre.toLowerCase().includes(q)) : rows);
            this.loading.set(false);
        },
        error: async () => {
            this.loading.set(false);
            (await this.toast.create({ message: 'Error cargando productos', duration: 1800, color: 'danger' })).present();
        }
        });
    }

    /* ---------- Modales ---------- */

    async openCreateTipo() {
        const m = await this.modal.create({ component: TipoFormModalComponent });
        await m.present();
        const { role, data } = await m.onDidDismiss();
        if (role === 'ok') {
        this.tipos.update(list => [...list, data]);
        this.filters.patchValue({ tipo: String(data.id) });
        }
    }

    async openCreateProducto() {
        const m = await this.modal.create({
        component: ProductoFormModalComponent,
        componentProps: { tipos: this.tipos() }
        });
        await m.present();
        const { role, data } = await m.onDidDismiss();
        if (role === 'ok') this.rows.update(list => [data, ...list]);
    }

    async openEditProducto(p: Producto) {
        const m = await this.modal.create({
        component: ProductoFormModalComponent,
        componentProps: { tipos: this.tipos(), producto: p }
        });
        await m.present();
        const { role, data } = await m.onDidDismiss();
        if (role === 'ok') this.rows.update(list => list.map(x => x.id === data.id ? data : x));
    }

    /* ---------- Estado ---------- */

    toggleEstado(p: Producto) {
        const nuevo: Estado = p.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.svc.setEstadoProducto(p.id, nuevo).subscribe(() => {
        this.rows.update(list => list.map(x => x.id === p.id ? ({ ...x, estado: nuevo }) : x));
        });
    }
}

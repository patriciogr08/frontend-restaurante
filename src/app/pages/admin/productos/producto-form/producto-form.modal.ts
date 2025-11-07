import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsService } from '../../../../core/services/products.service';
import { Producto, TipoProducto } from '../../../../core/models/products.models';

@Component({
    standalone: true,
    selector: 'app-producto-form',
    templateUrl: './producto-form.modal.html',
    styleUrls: ['./producto-form.modal.scss'],
    imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class ProductoFormModalComponent {
    @Input() producto?: Producto;
    @Input() tipos: TipoProducto[] = [];

    private fb = inject(FormBuilder);
    private svc = inject(ProductsService);
    private modal = inject(ModalController);

    form = this.fb.group({
        tipoProductoId: [null as unknown as number, Validators.required],
        nombre: ['', [Validators.required, Validators.maxLength(120)]],
        descripcion: [''],
        precio: [0, [Validators.required, Validators.min(0)]],
        tieneDescuento: [false],
        descuentoPorcentaje: [{ value: 0, disabled: true }, [Validators.min(0), Validators.max(100)]],
        descuentoValor:      [{ value: 0, disabled: true }, [Validators.min(0)]],
    });


    ngOnInit() {
        if (this.producto) {
            const p = this.producto;
            this.form.patchValue({
                tipoProductoId: p.tipoProducto.id,
                nombre: p.nombre,
                descripcion: p.descripcion || '',
                precio: p.precio,
                tieneDescuento: p.tieneDescuento,
                descuentoPorcentaje: p.descuentoPorcentaje,
                descuentoValor: p.descuentoValor,
            });
        } else if (this.tipos?.length) {
            this.form.patchValue({ tipoProductoId: this.tipos[0].id });
        }

        // 🔁 Reactivar/desactivar campos de descuento
        this.form.get('tieneDescuento')!.valueChanges.subscribe(on => {
            const pct = this.form.get('descuentoPorcentaje')!;
            const val = this.form.get('descuentoValor')!;
            if (on) {
                pct.enable({ emitEvent: false }); val.enable({ emitEvent: false });
            } else {
                pct.reset(0, { emitEvent: false }); pct.disable({ emitEvent: false });
                val.reset(0, { emitEvent: false }); val.disable({ emitEvent: false });
            }
        });

        // Si llega editando y tieneDescuento = true, habilita al cargar
        if (this.form.value.tieneDescuento) {
            this.form.get('descuentoPorcentaje')!.enable({ emitEvent: false });
            this.form.get('descuentoValor')!.enable({ emitEvent: false });
        }
    }

    submit() {
        if (this.form.invalid) return;
        const v = this.form.getRawValue(); // getRawValue para tomar campos deshabilitados si fuese el caso

        const payload = {
            tipoProductoId: v.tipoProductoId!,
            nombre: v.nombre!,
            descripcion: v.descripcion || null,
            precio: v.precio!,
            tieneDescuento: !!v.tieneDescuento,
            descuentoPorcentaje: v.tieneDescuento ? (v.descuentoPorcentaje ?? 0) : 0,
            descuentoValor:      v.tieneDescuento ? (v.descuentoValor ?? 0)      : 0,
        };

        const req = this.producto
                    ? this.svc.updateProducto(this.producto.id, payload)
                    : this.svc.createProducto(payload);

        req.subscribe(p => this.modal.dismiss(p, 'ok'));
    }

    close() { this.modal.dismiss(null, 'cancel'); }
}

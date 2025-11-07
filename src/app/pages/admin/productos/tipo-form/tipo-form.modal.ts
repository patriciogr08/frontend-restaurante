import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsService } from '../../../../core/services/products.service';
import { TipoProducto } from '../../../../core/models/products.models';

@Component({
  standalone: true,
  selector: 'app-tipo-form',
  templateUrl: './tipo-form.modal.html',
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
})
export class TipoFormModalComponent {
    private fb = inject(FormBuilder);
    private svc = inject(ProductsService);
    private modal = inject(ModalController);

    form = this.fb.group({
        nombre: ['', [Validators.required, Validators.maxLength(80)]],
    });

    submit() {
        if (this.form.invalid) return;
        this.svc.createTipo({ nombre: this.form.value.nombre! })
        .subscribe((t: TipoProducto) => this.modal.dismiss(t, 'ok'));
    }

    close() { this.modal.dismiss(null, 'cancel'); }
}

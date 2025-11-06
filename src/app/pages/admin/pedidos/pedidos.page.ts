import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentChangeEventDetail } from '@ionic/angular';
import { FormControl, FormsModule } from '@angular/forms'; // ⬅️ IMPORTANTE
import { IonContent, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';

type Estado = 'en_proceso' | 'despachados' | 'cobrados' | 'cancelados';


@Component({
    standalone: true,
    selector: 'app-pedidos',
    imports: [
        CommonModule, FormsModule,
        IonContent, IonSegment, IonSegmentButton, IonLabel
    ],
    templateUrl: './pedidos.page.html'
})
export class PedidosPage {
    // No-nullable => nunca será null
    readonly estadoCtrl = new FormControl<Estado>('en_proceso', { nonNullable: true });

    constructor() {

    }

    onSegmentChange(ev: CustomEvent<SegmentChangeEventDetail>) {
        const v = ev.detail.value as Estado | null;
        if (!v) return;               // protege undefined/null
        this.estadoCtrl.setValue(v);  // seguro: Estado
    }
}

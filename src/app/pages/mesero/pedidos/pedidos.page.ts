// src/app/pages/mesero/pedidos/pedidos.page.ts
import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';

@Component({
    standalone: true,
    selector: 'app-pedidos-mesero',
    imports: [IonContent, IonHeader, IonToolbar, IonTitle],
    templateUrl: './pedidos.page.html',
    styleUrls: ['./pedidos.page.scss']
})
export class PedidosPage {}

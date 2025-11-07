// src/app/pages/mesero/mesas/mesas.page.ts
import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';

@Component({
    standalone: true,
    selector: 'app-mesas',
    imports: [IonContent, IonHeader, IonToolbar, IonTitle],
    templateUrl: './mesas.page.html',
    styleUrls: ['./mesas.page.scss']
})
export class MesasPage {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
    standalone: true,
    selector: 'app-productos',
    imports: [CommonModule, IonContent],
    templateUrl: './productos.page.html'
})
export class ProductosPage {}

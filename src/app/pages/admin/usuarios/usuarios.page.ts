import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
    standalone: true,
    selector: 'app-usuarios',
    imports: [CommonModule, IonContent],
    templateUrl: './usuarios.page.html'
})
export class UsuariosPage {}

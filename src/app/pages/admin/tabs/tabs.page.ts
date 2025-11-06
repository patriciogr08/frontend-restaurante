import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon,
    IonLabel,AlertController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

import { addIcons } from 'ionicons';
import {
  speedometerOutline,
  listOutline,
  pricetagsOutline,
  peopleOutline,
  personCircleOutline
} from 'ionicons/icons';

@Component({
    standalone: true,
    selector: 'app-admin-tabs',
    templateUrl: './tabs.page.html',
    styleUrls: ['./tabs.page.scss'],
    imports: [
        CommonModule, RouterLink,
        IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
        IonContent, IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon,
        IonLabel
  ]
})
export class TabsPage {
    private auth = inject(AuthService);
    private alert = inject(AlertController);

    constructor() {
        addIcons({
            speedometerOutline,
            listOutline,
            pricetagsOutline,
            peopleOutline,
            personCircleOutline
        });
    }

    async doLogout() {
        const a = await this.alert.create({
        header: 'Salir',
        message: '¿Deseas cerrar sesión?',
        buttons: [
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Cerrar sesión', role: 'destructive', handler: () => this.auth.logout() }
        ]
        });
        await a.present();
    }
}

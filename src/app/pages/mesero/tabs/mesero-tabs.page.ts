import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gridOutline, restaurantOutline, listOutline, personCircleOutline } from 'ionicons/icons';

@Component({
    standalone: true,
    selector: 'app-mesero-tabs',
    imports: [ RouterLink,IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
    templateUrl: './mesero-tabs.page.html',
    styleUrls: ['./mesero-tabs.page.scss']
})
export class MeseroTabsPage {
    constructor() {
        addIcons({ gridOutline, restaurantOutline, listOutline, personCircleOutline });
    }
}

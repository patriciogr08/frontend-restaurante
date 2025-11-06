import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
    standalone: true,
    selector: 'app-dashboard',
    imports: [CommonModule, IonContent],
    templateUrl: './dashboard.page.html'
})
export class DashboardPage {}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-profile-card',
    imports: [CommonModule],
    templateUrl: './profile-card.component.html',
    styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
    @Input() usuario = '';
    @Input() nombre?: string;
    @Input() rol?: string;
    @Input() avatarUrl?: string;

    get initials() {
        const base = (this.nombre || this.usuario || '').trim();
        return base ? base.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : 'U';
    }
}

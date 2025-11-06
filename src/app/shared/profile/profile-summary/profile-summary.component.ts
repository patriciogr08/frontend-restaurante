import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-profile-summary',
  imports: [CommonModule],
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss']
})
export class ProfileSummaryComponent {
    @Input() nombre?: string;
    @Input() usuario = '';
    @Input() avatarUrl?: string;

    get initials() {
        const base = (this.nombre || this.usuario || '').trim();
        return base ? base.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : 'U';
    }
}

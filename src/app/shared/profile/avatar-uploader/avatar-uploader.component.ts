import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-avatar-uploader',
  imports: [CommonModule, IonButton],
  templateUrl: './avatar-uploader.component.html',
  styleUrls: ['./avatar-uploader.component.scss']
})
export class AvatarUploaderComponent {
    @Input() avatarUrl?: string | null = null;
    @Output() fileChange = new EventEmitter<File>();

    preview: string | null = null;

    onFile(e: Event) {
        const input = e.target as HTMLInputElement;
        const f = input.files?.[0];
        if (!f) return;
        this.fileChange.emit(f);
        const reader = new FileReader();
        reader.onload = () => this.preview = reader.result as string;
        reader.readAsDataURL(f);
    }
}

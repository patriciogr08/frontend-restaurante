// src/app/shared/profile/profile.service.ts
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Profile, UpdateProfileDto, ChangePasswordDto } from './profile.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private api = inject(ApiService);

    me(): Observable<Profile> {
        return this.api.get<Profile>('/perfil/me');
    }

    update(data: UpdateProfileDto): Observable<Profile> {
        return this.api.post<Profile>('/perfil/update', data);
    }

    changePassword(data: ChangePasswordDto) {
        return this.api.post('/perfil/change-password', data);
    }

    uploadAvatar(file: File) {
        const form = new FormData();
        form.append('avatar', file);
        return this.api.post<Profile>('/perfil/avatar', form);
    }
}

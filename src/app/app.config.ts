import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { apiPrefixInterceptor } from './core/interceptors/api-prefix.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideHttpClient(withInterceptors([apiPrefixInterceptor,authInterceptor])),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
  ]
};
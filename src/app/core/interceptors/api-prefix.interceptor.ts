import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const SKIP_API_PREFIX = new HttpContextToken<boolean>(() => false);

function isAbsolute(url: string) {
  return /^https?:\/\//i.test(url);
}

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
    // Si es absoluta o se pidió saltar, no tocar
    if (req.context.get(SKIP_API_PREFIX) || isAbsolute(req.url)) {
        return next(req);
    }

    const url = `${environment.apiBaseUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    const clone = req.clone({ url });

    return next(clone);
};

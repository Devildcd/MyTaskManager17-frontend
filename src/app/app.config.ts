import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { bodyguardInterceptor } from './auth/interceptor/bodyguard.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideToastr(),
    provideHttpClient(withInterceptors([bodyguardInterceptor])),
    { provide: HTTP_INTERCEPTORS, useValue: bodyguardInterceptor, multi: true },
  ],
};

import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Route data reaches a component as an input, which is how the legal
    // pages are told which of the three texts to render - a route knows
    // that, a component should not have to look it up.
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
  ],
};

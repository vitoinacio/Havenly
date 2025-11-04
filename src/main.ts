import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { getApp } from 'firebase/app';
import {
  initializeAuth,
  indexedDBLocalPersistence,
  getAuth,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(environment.firebase)),

  provideAuth(() => {
    const app = getApp();

    if (Capacitor.isNativePlatform()) {
      try {
        return initializeAuth(app, {
          persistence: indexedDBLocalPersistence,
        });
      } catch {
        return getAuth(app);
      }
    }

    return getAuth(app);
  }),

  provideStorage(() => getStorage()),
  provideFirestore(() => getFirestore()),
];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withEnabledBlockingInitialNavigation()
    ),
    ...firebaseProviders,
  ],
});

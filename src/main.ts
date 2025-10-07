import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// ✅ Firebase config
const firebaseProviders = [
  provideFirebaseApp(() => initializeApp({
    apiKey: "AIzaSyAUtMlqnnTU-EZxJ8F0-3n3ZvmyOOze8FE",
    authDomain: "havenly-b018c.firebaseapp.com",
    projectId: "havenly-b018c",
    //storageBucket: "havenly-b018c.firebasestorage.app",
    storageBucket: "havenly-b018c.appspot.com",
    messagingSenderId: "526082973455",
    appId: "1:526082973455:web:c4e8c735c93555be7c687a",
    measurementId: "G-YNW1QJ9BCM"
  })),
  provideAuth(() => getAuth()),
  provideStorage(() => getStorage()), 
  provideFirestore(() => getFirestore()) 

];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    ...firebaseProviders // ✅ isso injeta o Auth corretamente
  ]
});

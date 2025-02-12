import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { environment } from '../environments/environment.prod';
import { KegTrackerComponent } from './keg-tracker/keg-tracker.component';
import { TapListComponent } from './tap-list/tap-list.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KegTrackerComponent,
    TapListComponent,
    AngularFirestoreModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'brewery-front-of-house';
  private firestore: Firestore;

  constructor() {
   
    const app = initializeApp(environment.firebaseConfig);
    this.firestore = getFirestore(app); // Initialize Firestore
    console.log('Firebase initialized:', app);
  }

  ngOnInit() {
  }
}

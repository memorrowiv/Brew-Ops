import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { environment } from '../environments/environment.prod';
import { KegTrackerComponent } from './keg-tracker/keg-tracker.component';
import { TapListComponent } from './tap-list/tap-list.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    KegTrackerComponent,
    TapListComponent,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'brewery-front-of-house';
  private firestore: Firestore;

  constructor() {
    const app = initializeApp(environment.firebaseConfig); // Initialize Firebase app
    this.firestore = getFirestore(app); // Get Firestore instance
    console.log('Firebase initialized:', app);
  }

  ngOnInit() {
  }

}

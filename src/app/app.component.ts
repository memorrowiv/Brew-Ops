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

  // Example of interacting with Firestore to save keg state
  private async saveKegState(kegId: string, kegData: any): Promise<void> {
    try {
      const kegRef = doc(this.firestore, 'kegs', kegId);
      await setDoc(kegRef, kegData); // Save keg data to Firestore
      console.log('Keg state saved:', kegData);
    } catch (error) {
      console.error('Error saving keg state:', error);
    }
  }
}

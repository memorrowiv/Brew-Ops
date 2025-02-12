import { Component } from '@angular/core';
import { Keg } from '../models/keg.models';
import { Tap } from '../models/tap.models';
import { getFirestore, Firestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment.prod';
import { getApp } from 'firebase/app'; 
import { on } from 'events';

@Component({
  selector: 'app-tap-list',
  standalone: true,
  templateUrl: './tap-list.component.html',
  styleUrls: ['./tap-list.component.css'],
})
export class TapListComponent {
  title = 'Tap List';
  numTaps: number = 12;
  taps: Tap[] = [];
  kegs: Keg[] = [];
  private firestore!: Firestore;

  constructor() {
    if (typeof window !== 'undefined') {
      const app = getApp(); // Reuse the already initialized app from AppComponent
      this.firestore = getFirestore(app);
      this.loadKegs();
      this.updateTaps();
    }
  }

  async loadKegs() {
    try {
      const kegsCollection = collection(this.firestore, 'kegs');
      const kegsSnapshot = await getDocs(kegsCollection);
  
      if (!kegsSnapshot.empty) {
        this.kegs = kegsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Keg[];
      } else {
        this.kegs = []; 
        console.log('No kegs found, initializing empty state.');
      }
    } catch (error) {
      console.error('Error loading kegs:', error);
      this.kegs = []; 
    }
  }

  updateTaps() {
    this.taps = [];
    for (let i = 1; i <= this.numTaps; i++) {
      this.taps.push({ number: i, assignedKeg: null, isLastKeg: false });
    }
  }

  
  


}

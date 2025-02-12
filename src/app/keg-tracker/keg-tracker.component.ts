import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Keg } from '../models/keg.models'; 
import { getFirestore, Firestore, collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment.prod';
import { getApp } from 'firebase/app'; 

@Component({
  selector: 'app-keg-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keg-tracker.component.html',
  styleUrls: ['./keg-tracker.component.css'],
})
export class KegTrackerComponent {
  kegs: Keg[] = [];
  private firestore: Firestore;

  constructor() {
    const app = getApp(); // Reuse the already initialized app
    this.firestore = getFirestore(app); // Get Firestore instance from the already initialized app
    this.loadKegs();
  }

  // Loads kegs from Firestore
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
        this.kegs = []; // Ensure it's empty if no data is found
        console.log('No kegs found, initializing empty state.');
      }
    } catch (error) {
      console.error('Error loading kegs:', error);
      this.kegs = []; // Default to an empty array in case of error
    }
  }
  

  // Adds a new keg to Firestore
  async addKegs(beerName: string, kegSize: string, quantity: number) {
    const newKeg: Keg = { id: '', beerName, kegSize, quantity };
    await this.addKegToFirestore(newKeg);
    this.kegs.push(newKeg); // Add to local array for immediate update
  }

  // Adds a new keg document to Firestore
  async addKegToFirestore(keg: Keg) {
    try {
      const kegsCollection = collection(this.firestore, 'kegs');
      const docRef = await addDoc(kegsCollection, keg);
      keg.id = docRef.id; // Assign the generated ID to the keg object
    } catch (error) {
      console.error('Error adding keg to Firestore:', error);
    }
  }

  // Adds quantity to a specific keg
  async addQuantity(id: string) {
    const keg = this.kegs.find(keg => keg.id === id);
    if (keg) {
      keg.quantity += 1;
      await this.updateKegInFirestore(keg);
    } else {
      console.log('Keg not found');
    }
  }

  // Decreases quantity of a specific keg
  async kickKeg(id: string) {
    const keg = this.kegs.find(keg => keg.id === id);
    if (keg && keg.quantity > 0) {
      keg.quantity -= 1;
      await this.updateKegInFirestore(keg);
    } else {
      console.log('Keg not found or quantity already at 0');
    }
  }

  // Updates the keg document in Firestore
  async updateKegInFirestore(keg: Keg) {
    try {
      const kegDocRef = doc(this.firestore, 'kegs', keg.id);
      await updateDoc(kegDocRef, {
        quantity: keg.quantity
      });
    } catch (error) {
      console.error('Error updating keg in Firestore:', error);
    }
  }
}

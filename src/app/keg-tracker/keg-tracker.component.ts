import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Keg } from '../models/keg.models'; 
import { getFirestore, Firestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment.prod';
import { getApp } from 'firebase/app'; 
import { on } from 'events';

import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-keg-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatListModule, MatIconModule],
  templateUrl: './keg-tracker.component.html',
  styleUrls: ['./keg-tracker.component.css'],
})
export class KegTrackerComponent {
  kegSizes = ['Half Barrel (15.5 gal)', 'Quarter Barrel (7.75 gal)', 'Sixth Barrel (5.16 gal)', 'Mini Keg (1.32 gal)'];
  kegs: Keg[] = [];
  private firestore!: Firestore;

  constructor() {
    if (typeof window !== 'undefined') {
      const app = getApp(); // Reuse the already initialized app from AppComponent
      this.firestore = getFirestore(app);
      this.loadKegs();
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
  


  async addKegs(beerName: string, kegSize: string, quantity: number) {
    console.log('Adding keg:', beerName, kegSize, quantity);
    const newKeg: Keg = { id: '', beerName, kegSize, quantity, onTap: false };
    await this.addKegToFirestore(newKeg);
    this.kegs.push(newKeg);
  }

  onAddKeg(event: Event, beerName: string, kegSize: string, quantity: number) {
    event.preventDefault(); 
    console.log('Form submitted:', beerName, kegSize, quantity); 
    this.addKegs(beerName, kegSize, quantity); 
  }
  

 
  async addKegToFirestore(keg: Keg) {
    try {
      const kegsCollection = collection(this.firestore, 'kegs');
      
      const docRef = await addDoc(kegsCollection, {
        beerName: keg.beerName,
        kegSize: keg.kegSize,
        quantity: keg.quantity,
        onTap: keg.onTap,
      });
  
      keg.id = docRef.id;
  
      console.log(`Keg added with ID: ${keg.id}`);
    } catch (error) {
      console.error('Error adding keg to Firestore:', error);
    }
  }
  

  
  async addQuantity(id: string) {
    const keg = this.kegs.find(keg => keg.id === id);
    if (keg) {
      keg.quantity += 1;
      await this.updateKegInFirestore(keg);
    } else {
      console.log('Keg not found');
    }
  }

  
  async kickKeg(id: string) {
    const kegIndex = this.kegs.findIndex(keg => keg.id === id);
  
    if (kegIndex !== -1) {
      const keg = this.kegs[kegIndex];
  
      if (keg.quantity > 1) {
        keg.quantity -= 1;
        await this.updateKegInFirestore(keg);
      } else {
        // Quantity is 1, so remove from Firestore and local array
        await this.deleteKegFromFirestore(id);
        this.kegs.splice(kegIndex, 1);
        await this.updateKegInFirestore(keg); 
      }
    } else {
      console.log('Keg not found or already removed');
    }
  }
  
  // Function to delete keg from Firestore
  async deleteKegFromFirestore(id: string) {
    try {
      const kegDocRef = doc(this.firestore, 'kegs', id);
      await deleteDoc(kegDocRef);
      console.log(`Keg ${id} removed from Firestore`);
    } catch (error) {
      console.error('Error deleting keg from Firestore:', error);
    }
  }
  

  
  async updateKegInFirestore(keg: Keg) {
  try {
    if (!keg.id) {
      console.error('Invalid keg ID:', keg);  // Log the keg to check for an invalid ID
      return;
    }

    const kegDocRef = doc(this.firestore, 'kegs', keg.id);  // Reference to the specific keg by ID
    console.log('Updating keg in Firestore with ID:', keg.id);  // Log the ID being updated
    await updateDoc(kegDocRef, {
      quantity: keg.quantity,
    });
    console.log(`Keg ${keg.id} updated with new quantity: ${keg.quantity}`);
  } catch (error) {
    console.error('Error updating keg in Firestore:', error);
  }
}

}

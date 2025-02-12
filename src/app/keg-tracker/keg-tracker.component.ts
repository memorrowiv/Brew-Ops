import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Keg } from '../models/keg.models'; 
import { getFirestore, Firestore, collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment.prod';
import { getApp } from 'firebase/app'; 

@Component({
  selector: 'app-keg-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './keg-tracker.component.html',
  styleUrls: ['./keg-tracker.component.css'],
})
export class KegTrackerComponent {
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
    const newKeg: Keg = { id: '', beerName, kegSize, quantity };
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
      const docRef = await addDoc(kegsCollection, keg);
      keg.id = docRef.id;
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
    const keg = this.kegs.find(keg => keg.id === id);
    if (keg && keg.quantity > 0) {
      keg.quantity -= 1;
      await this.updateKegInFirestore(keg);
    } else {
      console.log('Keg not found or quantity already at 0');
    }
  }

  
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

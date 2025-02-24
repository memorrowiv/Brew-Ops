import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Keg } from '../models/keg.models';
import { Tap } from '../models/tap.models';
import { getFirestore, Firestore, collection, getDocs, updateDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tap-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatBadgeModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './tap-list.component.html',
  styleUrls: ['./tap-list.component.scss'],
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
      this.loadTaps();
    }
  }

  async initializeTapsInFirestore() {
    for (let i = 1; i <= this.numTaps; i++) {
      const tapDocRef = doc(this.firestore, 'taps', `${i}`);
      await setDoc(tapDocRef, {
        number: i,
        assignedKeg: null,
        isLastKeg: false,
      }, { merge: true });
    }
    this.loadTaps();
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

  async loadTaps() {
    try {
      const tapsCollection = collection(this.firestore, 'taps');
      const tapsSnapshot = await getDocs(tapsCollection);
  
      if (!tapsSnapshot.empty) {
        this.taps = tapsSnapshot.docs.map(doc => {
          const assignedKegData = doc.data()['assignedKeg'];
          const assignedKeg = assignedKegData
            ? this.kegs.find(keg => keg.id === assignedKegData.id) || null
            : null;
  
          return {
            number: doc.data()['number'],
            assignedKeg: assignedKeg,
            isLastKeg: doc.data()['isLastKeg'] || false,
          };
        });

        
        this.taps.sort((a, b) => a.number - b.number);
      } else {
        
        this.updateTaps();
        console.log('No taps found, initializing empty state.');
      }
    } catch (error) {
      console.error('Error loading taps:', error);
      this.updateTaps();
    }
  }
  
  

  updateTaps() {
    this.taps = [];
    for (let i = 1; i <= this.numTaps; i++) {
      this.taps.push({ number: i, assignedKeg: null, isLastKeg: false });
    }
  }

  async assignKegToTap(tapNumber: number, selectedKeg: Keg) {
    if (!selectedKeg) {
      return;  // If no keg is selected, do nothing
    }



    this.taps[tapNumber - 1].assignedKeg = selectedKeg;
    selectedKeg.onTap = true;

    // Update keg and tap in Firestore after assignment
    await this.updateKegInFirestore(selectedKeg);
    await this.updateTapInFirestore(tapNumber, selectedKeg);

    console.log(`Assigned ${selectedKeg.beerName} to tap ${tapNumber}`);
  }

  async unassignKegFromTap(tapNumber: number, keg: Keg) {
    this.taps[tapNumber - 1].assignedKeg = null;
    keg.onTap = false;

    
    await this.updateTapInFirestore(tapNumber, null);

    console.log(`Unassigned ${keg.beerName} from tap ${tapNumber}`);
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
        onTap: keg.onTap,
        quantity: keg.quantity,  // Update the quantity in Firestore
      });
      console.log(`Keg ${keg.id} updated in Firestore`);
    } catch (error) {
      console.error('Error updating keg in Firestore:', error);
    }
  }

  async updateTapInFirestore(tapNumber: number, keg: Keg | null) {
    try {
      const tapDocRef = doc(this.firestore, 'taps', `${tapNumber}`);
      
      // Check if the keg assigned to this tap is the last one in stock
      const isLastKeg = this.checkLastKeg(tapNumber);
  
      await setDoc(tapDocRef, {
        assignedKeg: keg,
        isLastKeg: isLastKeg,  // Update this tap with the correct last keg flag
      }, { merge: true });
      
      console.log(`Tap ${tapNumber} updated in Firestore`);
    } catch (error) {
      console.error('Error updating tap in Firestore:', error);
    }
  }
  

checkLastKeg(tapNumber: number): boolean {
  const assignedKeg = this.taps[tapNumber - 1]?.assignedKeg;
  if (!assignedKeg) return false;

  // Find out if the assigned keg is the last one in stock
  const isLastKeg = assignedKeg.quantity <= 1;
  return isLastKeg;
}

async kickKeg(id: string, tapNumber: number) {
  const kegIndex = this.kegs.findIndex(keg => keg.id === id);

  if (kegIndex !== -1) {
    const keg = this.kegs[kegIndex];

    if (keg.quantity > 1) {
      keg.quantity -= 1;
      await this.updateKegInFirestore(keg);
    } else {
      // Quantity is 1, so remove from Firestore and local array
      this.unassignKegFromTap(tapNumber, keg);
      await this.deleteKegFromFirestore(id);
      this.kegs.splice(kegIndex, 1);
      await this.updateKegInFirestore(keg); 
    }
  } else {
    console.log('Keg not found or already removed');
  }
}

async deleteKegFromFirestore(id: string) {
    try {
      const kegDocRef = doc(this.firestore, 'kegs', id);
      await deleteDoc(kegDocRef);
      console.log(`Keg ${id} removed from Firestore`);
    } catch (error) {
      console.error('Error deleting keg from Firestore:', error);
    }
  }

async confirmKickKeg(id: string, tapNumber: number) {
  const confirmation = confirm('Are you sure you want to kick this keg?');
  if (confirmation) {
    await this.kickKeg(id, tapNumber);
  }
}
}

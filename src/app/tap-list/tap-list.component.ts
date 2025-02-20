import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Keg } from '../models/keg.models';
import { Tap } from '../models/tap.models';
import { getFirestore, Firestore, collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

@Component({
  selector: 'app-tap-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
      this.loadTaps(); // Load taps on initialization
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
      });
      console.log(`Keg ${keg.id} updated in Firestore`);
    } catch (error) {
      console.error('Error updating keg in Firestore:', error);
    }
  }

  async updateTapInFirestore(tapNumber: number, keg: Keg | null) {
  try {
    const tapDocRef = doc(this.firestore, 'taps', `${tapNumber}`);
    
    // Ensure 'isLastKeg' is always a boolean value
    const isLastKeg = this.checkLastKeg();
    
    // Use merge: true to avoid overwriting other properties of the tap
    await setDoc(tapDocRef, {
      assignedKeg: keg,
      isLastKeg: isLastKeg,  // Ensure it's a valid boolean
    }, { merge: true });
    
    console.log(`Tap ${tapNumber} updated in Firestore`);
  } catch (error) {
    console.error('Error updating tap in Firestore:', error);
  }
}

checkLastKeg() {
  // Ensure we return a valid boolean value for 'isLastKeg'
  const lastKeg = this.kegs.find(keg => keg.onTap && keg.quantity <= 1);
  
  // If no last keg is found, return false
  return !!lastKeg;  // Returns true if a last keg exists, false otherwise
}


}

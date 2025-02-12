import { Routes } from '@angular/router';
import { KegTrackerComponent } from './keg-tracker/keg-tracker.component';
import { TapListComponent } from './tap-list/tap-list.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/keg-tracker', pathMatch: 'full' },
  { path: 'keg-tracker', component: KegTrackerComponent },
  { path: 'tap-list', component: TapListComponent },
];

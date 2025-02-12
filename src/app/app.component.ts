import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KegTrackerComponent } from './keg-tracker/keg-tracker.component';
import { TapListComponent } from './tap-list/tap-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, KegTrackerComponent, TapListComponent], // Import your components here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'brewery-front-of-house';
}

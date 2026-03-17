import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonList, IonItem, IonLabel, IonIcon, IonListHeader, IonButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  peopleCircleOutline, statsChartOutline, trophyOutline, 
  megaphoneOutline, personAddOutline 
} from 'ionicons/icons';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonList, IonItem, IonLabel, IonIcon, IonListHeader, IonButton, HeaderGlobalComponent
  ]
})
export class FeedPage {
  constructor() {
    addIcons({ 
      peopleCircleOutline, statsChartOutline, trophyOutline, 
      megaphoneOutline, personAddOutline 
    });
  }
}
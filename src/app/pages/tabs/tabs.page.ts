import { Component, ViewChild } from '@angular/core';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonModal, IonContent, IonSearchbar, IonList, IonItem,
  IonRouterOutlet, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, trophyOutline, settingsOutline, 
  personAddOutline, notificationsOutline, chatbubbleEllipsesOutline, 
  homeOutline, newspaperOutline, addCircle, trophy, menuOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    IonItem, IonList, IonSearchbar, IonContent, IonModal, 
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonRouterOutlet, IonMenuButton
  ],
})
export class TabsPage {
  @ViewChild('mBuscar') mBuscar!: IonModal;
  @ViewChild('mNotis') mNotis!: IonModal;
  @ViewChild('mMensajes') mMensajes!: IonModal;

  constructor() {
    addIcons({
      personOutline, trophyOutline, settingsOutline, personAddOutline, 
      notificationsOutline, chatbubbleEllipsesOutline, homeOutline, 
      newspaperOutline, addCircle, trophy, menuOutline
    });
  }
}
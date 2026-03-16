import { Component, ViewChild } from '@angular/core';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonModal, IonContent, IonSearchbar, IonList, IonItem,
  IonBadge, IonRouterOutlet, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, trophyOutline, settingsOutline, 
  personAddOutline, notificationsOutline, chatbubbleEllipsesOutline, 
  homeOutline, newspaperOutline, addCircle, trophy, locationOutline, 
  closeOutline, menuOutline 
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
    IonBadge, IonRouterOutlet, IonMenuButton
  ],
})
export class TabsPage {
  // Referencias para cerrar manualmente si el trigger falla
  @ViewChild('modalBuscar') modalBuscar!: IonModal;
  @ViewChild('modalNotis') modalNotis!: IonModal;
  @ViewChild('modalMensajes') modalMensajes!: IonModal;

  constructor() {
    addIcons({
      personOutline, trophyOutline, settingsOutline, personAddOutline, 
      notificationsOutline, chatbubbleEllipsesOutline, homeOutline, 
      newspaperOutline, addCircle, trophy, locationOutline, closeOutline, menuOutline
    });
  }

  // Función genérica para cerrar cualquier modal que cause conflicto
  cerrarTodo() {
    if (this.modalBuscar) this.modalBuscar.dismiss();
    if (this.modalNotis) this.modalNotis.dismiss();
    if (this.modalMensajes) this.modalMensajes.dismiss();
  }
}
import { Component, ViewChild } from '@angular/core';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonModal, IonContent, IonSearchbar, IonList, IonItem,
  IonRouterOutlet, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  // Iconos de los Tabs
  homeOutline, newspaperOutline, trophyOutline, personOutline, settingsOutline,
  // Iconos de Acciones (Header/Modales)
  personAddOutline, notificationsOutline, chatbubbleEllipsesOutline, 
  searchOutline, addCircle, trophy, menuOutline 
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
  // Referencias a los modales para abrirlos/cerrarlos por código
  @ViewChild('modalBuscar') modalBuscar!: IonModal; 
  @ViewChild('modalNotis') modalNotis!: IonModal;
  @ViewChild('modalMensajes') modalMensajes!: IonModal;

  constructor() {
    // Registramos todos los iconos que usaremos en la navegación inferior y superior
    addIcons({
      homeOutline,
      newspaperOutline,
      trophyOutline,
      personOutline,
      settingsOutline,
      personAddOutline, 
      notificationsOutline, 
      chatbubbleEllipsesOutline,
      searchOutline,
      addCircle, 
      trophy, 
      menuOutline
    });
  }

  // Métodos de utilidad por si necesitas disparar acciones desde el controlador
  cerrarModales() {
    this.modalBuscar?.dismiss();
    this.modalNotis?.dismiss();
    this.modalMensajes?.dismiss();
  }
}
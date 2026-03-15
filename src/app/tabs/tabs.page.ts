import { Component, inject } from '@angular/core';
import { 
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonModal, IonContent, IonSearchbar, IonList, IonItem,
  IonBadge, IonRouterOutlet // 👈 1. FALTA IMPORTAR ESTO
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, trophyOutline, settingsOutline, 
  personAddOutline, notificationsOutline, chatbubbleEllipsesOutline, 
  homeOutline, newspaperOutline, addCircle, trophy, locationOutline, calendarNumberOutline, peopleOutline, ribbonOutline, cashOutline, arrowForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  standalone: true,
  imports: [
    IonItem, IonList, IonSearchbar, IonContent, IonModal, 
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, 
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
    IonBadge,
    IonRouterOutlet // 👈 2. DEBES AGREGARLO AQUÍ
  ],
})
export class TabsPage {
  
  constructor() {
    addIcons({locationOutline,calendarNumberOutline,peopleOutline,ribbonOutline,cashOutline,arrowForwardOutline,personAddOutline,notificationsOutline,chatbubbleEllipsesOutline,addCircle,trophy,homeOutline,newspaperOutline,personOutline,trophyOutline,settingsOutline});
  }

  // Si usas Modals con 'trigger', estas funciones son opcionales
  irABuscarAmigos() { console.log('Buscando tenistas...'); }
  verNotificaciones() { console.log('Mostrando alertas...'); }
  irAMensajes() { console.log('Abriendo chat...'); }
}
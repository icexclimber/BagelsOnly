import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonMenuButton, IonModal, IonContent, IonSearchbar 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, notificationsOutline, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header-global',
  templateUrl: './header-global.component.html',
  styleUrls: ['./header-global.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonMenuButton, IonModal, IonContent, IonSearchbar
  ]
})
export class HeaderGlobalComponent {
  @Input() titulo: string = 'AMT';

  // Referencia para controlar el modal desde el código
  @ViewChild('modalBusqueda') modal!: IonModal;

  constructor() {
    addIcons({ personAddOutline, notificationsOutline, searchOutline });
  }

  // --- MÉTODOS QUE EL HTML NECESITA ---

  abrirModalBusqueda() {
    if (this.modal) {
      this.modal.present();
    }
  }

  cerrarModalBusqueda() {
    if (this.modal) {
      this.modal.dismiss();
    }
  }

  onSearch(event: any) {
    const query = event.detail.value.toLowerCase();
    console.log('Buscando tenista en Tijuana:', query);
    // Aquí iría tu lógica para filtrar oponentes
  }
}
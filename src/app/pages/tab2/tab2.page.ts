import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonModal, 
  IonList, IonItem, IonAvatar, IonLabel, IonBadge,
  IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton
} from '@ionic/angular/standalone';
import { Firestore, collection, collectionData, query, orderBy, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { addIcons } from 'ionicons';
import { trophyOutline, locationOutline, closeOutline } from 'ionicons/icons';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, 
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonModal, 
    IonList, IonItem, IonAvatar, IonLabel, IonBadge,
    IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton
  ]
})
export class Tab2Page {
  private firestore = inject(Firestore);
  
  jugadoresClub$: Observable<any[]> = of([]); // Observable dinámico
  clubSeleccionado: string = '';

  constructor() {
    addIcons({ trophyOutline, locationOutline, closeOutline });
  }

  // Esta función se activa al hacer clic en una tarjeta
  verRankingClub(nombreClub: string) {
    this.clubSeleccionado = nombreClub;
    
    // 1. Referencia a la colección
    const perfilesRef = collection(this.firestore, 'perfiles');
    
    // 2. Consulta filtrada por el club seleccionado y ordenada por nivel/puntos
    const q = query(
      perfilesRef, 
      where('club', '==', nombreClub), 
      orderBy('nivel', 'desc') 
    );
    
    // 3. Asignamos los datos al observable que lee el modal
    this.jugadoresClub$ = collectionData(q) as Observable<any[]>;
  }
}
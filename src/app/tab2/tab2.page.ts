import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngFor
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonModal, IonList, IonItem, IonLabel, IonAvatar, IonBadge, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone'; // 👈 Importa todos aquí
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonIcon, 
    CommonModule, 
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
    IonModal, IonList, IonItem, IonLabel, IonAvatar, IonBadge, IonButtons, IonButton
  ]
  // Asegúrate de importar IonCard, IonAvatar, etc.
})
export class Tab2Page implements OnInit {
  private firestore = inject(Firestore);
  
  // Observable que se actualiza solo cuando alguien se registra
  jugadoresTijuana$: Observable<any[]>;

  constructor() {
    // 1. Creamos la consulta a Firestore
    const perfilesRef = collection(this.firestore, 'perfiles');
    
    // 2. Ordenamos por 'nivel' de forma descendente (desc)
    const q = query(perfilesRef, orderBy('nivel', 'desc'));
    
    // 3. Obtenemos los datos en tiempo real
    this.jugadoresTijuana$ = collectionData(q) as Observable<any[]>;
  }

  ngOnInit() {}
}
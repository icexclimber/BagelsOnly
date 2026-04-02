import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, 
  IonLabel, IonSelect, IonSelectOption, IonAvatar, IonIcon, 
  IonText, IonBadge, IonNote, IonCard, IonGrid, IonRow, IonCol, IonSkeletonText
} from '@ionic/angular/standalone';
import { Firestore, collection, query, where, collectionData, orderBy, QueryConstraint } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, switchMap } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  locationOutline, medalOutline, trophy, alertCircleOutline, 
  chevronDownOutline, personOutline, checkmarkCircle, femaleOutline, maleOutline 
} from 'ionicons/icons';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, 
    IonLabel, IonSelect, IonSelectOption, IonAvatar, IonIcon, 
    IonText, IonBadge, IonNote, IonCard, IonGrid, IonRow, IonCol, IonSkeletonText
  ]
})
export class Tab4Page implements OnInit {
  private firestore = inject(Firestore);

  // Objeto de filtros centralizado
  filtros = {
    sede: 'CDB',
    genero: 'Todos',
    categoria: 'Todas',
    verificado: 'Todos',
    modalidad: 'Sencillos',
    tipoRanking: 'XP' // XP o BTRP
  };

  private filtrosSubject = new BehaviorSubject(this.filtros);
  jugadores$: Observable<any[]>;

  constructor() {
    addIcons({ 
      locationOutline, medalOutline, trophy, alertCircleOutline, 
      chevronDownOutline, personOutline, checkmarkCircle, femaleOutline, maleOutline 
    });

    this.jugadores$ = this.filtrosSubject.pipe(
  switchMap(f => {
    const perfilesRef = collection(this.firestore, 'perfiles');
    const constraints: QueryConstraint[] = [
      where('infoBasica.ubicacion', '==', f.sede)
    ];

    if (f.genero !== 'Todos') {
      constraints.push(where('infoBasica.genero', '==', f.genero));
    }

    // --- NUEVO: Filtro de Categoría ---
    if (f.categoria !== 'Todas') {
      constraints.push(where('infoBasica.categoria', '==', f.categoria));
    }

    if (f.verificado !== 'Todos') {
      constraints.push(where('infoBasica.nivelVerificado', '==', f.verificado === 'Si'));
    }

    const campoOrden = f.tipoRanking === 'XP' ? 'stats.puntos' : 'stats.btrp';
    constraints.push(orderBy(campoOrden, 'desc'));

    const q = query(perfilesRef, ...constraints);
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  })
);
  }

  ngOnInit() {}

  // Se llama cada vez que cualquier filtro cambia
  aplicarFiltros() {
    this.filtrosSubject.next({ ...this.filtros });
  }
}
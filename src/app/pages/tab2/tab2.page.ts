import { Component, inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonModal, 
  IonList, IonItem, IonAvatar, IonLabel, IonBadge,
  IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  trophyOutline, locationOutline, closeOutline, 
  informationCircleOutline, closeCircle 
} from 'ionicons/icons';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { RankingsService } from '../../core/services/rankings.service'; 
import { Subscription } from 'rxjs';

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
    IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton, IonNote
  ]
})
export class Tab2Page implements OnDestroy {
  // REFERENCIA DIRECTA AL MODAL (Esto soluciona que las tarjetas no abran)
  @ViewChild('m') modalRanking!: IonModal;

  private rankingsService = inject(RankingsService);

  sedeSeleccionada: string = '';
  rankingActual: any[] = [];
  private rankingSub?: Subscription;

  sedes = [
    {id: 'UDT', nombre: 'Unidad Deportiva Tijuana', sub: 'Sede Municipal', img: 'assets/img/unidad.jpg'},
    {id: 'CBT', nombre: 'Club Bancario Tijuana', sub: 'Sede Otay', img: 'assets/img/bancario.jpg'},
    {id: 'CCT', nombre: 'Club Campestre Tijuana', sub: 'Sede Zona Río', img: 'assets/img/campestre.jpeg'},
    {id: 'CBR', nombre: 'Club Britania Tijuana', sub: 'Sede Los Pinos', img: 'assets/img/britania.jpeg'},
    {id: 'PA', nombre: 'Punta Azul', sub: 'Ensenada', img: 'assets/img/punta-azul.jpeg'}
  ];

  constructor() {
    // Añadimos closeCircle para el estilo de burbuja que implementamos
    addIcons({ trophyOutline, locationOutline, closeOutline, informationCircleOutline, closeCircle });
  }

  /**
   * Nueva función simplificada. 
   * Ya no necesita recibir el modal por parámetro desde el HTML.
   */
  async abrirRankingClub(nombreSede: string) {
    console.log('Solicitando ranking para:', nombreSede);
    this.sedeSeleccionada = nombreSede;
    
    // 1. Limpiamos datos anteriores para que no se vea el ranking anterior mientras carga
    this.rankingActual = [];

    // 2. Abrimos el modal usando la referencia @ViewChild
    if (this.modalRanking) {
      this.modalRanking.present();
    }

    // 3. Gestión de suscripción
    if (this.rankingSub) this.rankingSub.unsubscribe();

    this.rankingSub = this.rankingsService.getRankingPorCiudad(nombreSede).subscribe({
      next: (datos: any[]) => {
        this.rankingActual = datos;
        console.log('Datos recibidos:', datos.length);
      },
      error: (err: any) => {
        console.error('Error de Firebase:', err);
      }
    });
  }

  ngOnDestroy() {
    if (this.rankingSub) {
      this.rankingSub.unsubscribe();
    }
  }
}
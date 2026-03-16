import { Component, inject, ViewChild, OnDestroy } from '@angular/core'; // Aseguramos OnDestroy
import { CommonModule } from '@angular/common';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonModal, 
  IonList, IonItem, IonAvatar, IonLabel, IonBadge,
  IonGrid, IonRow, IonCol, IonIcon, IonButtons, IonButton, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trophyOutline, locationOutline, closeOutline, informationCircleOutline } from 'ionicons/icons';
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
export class Tab2Page implements OnDestroy { // Aquí empieza el contrato
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
    addIcons({ trophyOutline, locationOutline, closeOutline, informationCircleOutline });
  }

  // Recibimos el modal como parámetro para asegurar que abra
async abrirRankingClub(nombreSede: string, modal: any) {
  console.log('Clic detectado en:', nombreSede);
  this.sedeSeleccionada = nombreSede;
  
  // 1. Abrimos el modal PRIMERO para que el usuario vea acción inmediata
  modal.present();

  if (this.rankingSub) this.rankingSub.unsubscribe();

  // 2. Luego nos suscribimos a los datos
  this.rankingSub = this.rankingsService.getRankingPorCiudad(nombreSede).subscribe({
    next: (datos: any[]) => {
      this.rankingActual = datos;
    },
    error: (err: any) => {
      console.error('Error de Firebase:', err);
    }
  });
}

  // ESTA ES LA FUNCIÓN QUE TE FALTABA Y CAUSABA EL ERROR
  ngOnDestroy() {
    if (this.rankingSub) {
      this.rankingSub.unsubscribe();
      console.log('Suscripción de Ranking cerrada correctamente.');
    }
  }
}
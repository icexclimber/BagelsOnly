import { Component, OnInit, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, 
  IonBadge, IonText, IonProgressBar, ModalController,
  IonItem, IonLabel, IonList, IonCard, IonCardHeader, IonCardSubtitle, 
  IonCardTitle, IonCardContent, ToastController, IonButtons, IonFab, IonFabButton, IonSpinner,
  IonGrid, IonRow, IonCol, IonAvatar, ActionSheetController, AlertController,
  IonSelect, IonSelectOption, IonInput, IonTextarea, IonModal 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, statsChart, trophy, arrowForwardOutline, 
  informationCircleOutline, personAddOutline, heartOutline, closeOutline,
  checkmarkCircleOutline, flashOutline, locationOutline, timeOutline, tennisballOutline,
  peopleOutline, expandOutline, cashOutline, listOutline, openOutline,
  saveOutline, star, medalOutline, trophyOutline, reorderTwoOutline, people, checkmarkCircle,
  addCircleOutline, statsChartOutline, tennisball, addCircle, trashOutline
} from 'ionicons/icons';

import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { AuthService } from '../../core/services/auth.service';
import { RankingsService } from '../../core/services/rankings.service';
import { 
  Firestore, collection, query, where, onSnapshot, orderBy, 
  doc, updateDoc, serverTimestamp, writeBatch, getDoc, getDocs, addDoc, arrayUnion, deleteDoc 
} from '@angular/fire/firestore';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

// ==========================================================================
// 1. COMPONENTES DE APOYO
// ==========================================================================

@Component({
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule],
  template: `
    <ion-content class="img-full-bg" (click)="cerrar()">
      <ion-icon name="close-outline" class="close-btn-abs"></ion-icon>
      <div class="img-center-container">
        <img [src]="imgUrl" class="animate__animated animate__zoomIn" />
      </div>
    </ion-content>
  `
})
class ImagenFullModal {
  private modalCtrl = inject(ModalController);
  imgUrl: string = '';
  cerrar() { this.modalCtrl.dismiss(); }
}

@Component({
  selector: 'app-ladder-modal',
  standalone: true,
  imports: [ IonContent, IonButton, IonIcon, IonBadge, IonFab, IonFabButton, IonItem, IonLabel, IonList, IonAvatar, IonSpinner, CommonModule, DragDropModule ],
  template: `
    <ion-content class="detalle-torneo-aero">
      <ion-fab vertical="top" horizontal="end" slot="fixed">
        <ion-fab-button size="small" color="light" (click)="cerrar()">
          <ion-icon name="close-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <div class="header-image-container">
        <img [src]="ladder.imagen || 'assets/img/bancario.jpg'" class="bg-image" />
        <div class="glass-overlay">
          <ion-badge color="warning" mode="ios">Ranking Oficial TJ</ion-badge>
          <h1 class="torneo-title">{{ ladder.nombre }}</h1>
        </div>
      </div>
      <div class="info-body ion-padding">
        <div class="stats-bubble">
          <div class="stat-item"><ion-icon name="people-outline"></ion-icon><p>{{ integrantes.length }}</p><small>Tenistas</small></div>
          <div class="stat-divider"></div>
          <div class="stat-item"><ion-icon name="star" color="warning"></ion-icon><p>#{{ ladder.tuPosicion || '-' }}</p><small>Tu Lugar</small></div>
        </div>
        <h3 class="section-subtitle ion-margin-top" style="color: #000; font-weight: 850;">Ranking en Tiempo Real</h3>
        <div *ngIf="cargando" class="ion-text-center ion-padding"><ion-spinner name="crescent" color="primary"></ion-spinner></div>
        <div class="table-container ion-margin-top" *ngIf="!cargando">
          <div class="table-header"><div class="col-rank">#</div><div class="col-name">Jugador</div><div class="col-stats">W-L</div><div class="col-drag"></div></div>
          <div cdkDropList class="player-table" (cdkDropListDropped)="onDrop($event)">
            <div *ngFor="let jugador of integrantes; let i = index" cdkDrag class="table-row">
              <div class="col-rank"><span [class.top-three]="i < 3">{{ i + 1 }}</span></div>
              <div class="col-name"><div class="name-text">{{ jugador.nombre }}</div><div class="club-text">{{ jugador.club || 'Home Club' }}</div></div>
              <div class="col-stats"><span class="win">{{ jugador.w || 0 }}</span>-<span class="loss">{{ jugador.l || 0 }}</span></div>
              <div class="col-drag"><ion-icon name="reorder-two-outline"></ion-icon></div>
            </div>
          </div>
        </div>
        <ion-button *ngIf="!cargando" expand="block" color="success" class="ion-margin-top" (click)="guardarCambios()">ACTUALIZAR RANKING <ion-icon name="save-outline" slot="end"></ion-icon></ion-button>
      </div>
    </ion-content>
  `
})
class DetalleLadderModal implements OnInit {
  private modalCtrl = inject(ModalController);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);
  ladder: any; integrantes: any[] = []; cargando: boolean = true;
  ngOnInit() { this.cargarRankingReal(); }
  cargarRankingReal() {
    runInInjectionContext(this.injector, () => {
      onSnapshot(query(collection(this.firestore, 'bancario_ladder_members'), orderBy('posicion', 'asc')), (snap) => {
        this.integrantes = snap.docs.map(d => ({ id: d.id, ...d.data() })); this.cargando = false;
      });
    });
  }
  cerrar() { this.modalCtrl.dismiss(); }
  onDrop(event: CdkDragDrop<string[]>) {
    const arr = [...this.integrantes];
    const item = arr.splice(event.previousIndex, 1)[0];
    arr.splice(event.currentIndex, 0, item);
    this.integrantes = arr;
  }
  async guardarCambios() {
    const batch = writeBatch(this.firestore);
    this.integrantes.forEach((j, i) => batch.update(doc(this.firestore, `bancario_ladder_members/${j.id}`), { posicion: i + 1 }));
    await batch.commit(); this.modalCtrl.dismiss();
  }
}

@Component({
  standalone: true,
  imports: [ IonContent, IonButton, IonIcon, IonBadge, IonFab, IonFabButton, IonGrid, IonRow, IonCol, CommonModule, IonItem, IonLabel ],
  template: `
    <ion-content style="--background: #fff;">
      <ion-fab vertical="top" horizontal="end" slot="fixed">
        <ion-fab-button size="small" color="dark" (click)="cerrar()">
          <ion-icon name="close-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <div style="position: relative; height: 220px; background: #f0f0f0;">
        <img [src]="torneo.imagen || 'assets/img/bancario.jpg'" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8));">
           <ion-badge color="primary">{{ torneo.basica?.subhead || torneo.categoria }}</ion-badge>
        </div>
      </div>

      <div class="ion-padding">
        <h1 style="font-weight: 900; margin: 0 0 10px 0; color: #1a1a1a; font-size: 1.8rem;">
          {{ torneo.basica?.titulo || torneo.nombre }}
        </h1>
        
        <p style="color: #666; line-height: 1.6; font-size: 1rem; margin-bottom: 20px;">
          {{ torneo.basica?.descripcion || torneo.desc || 'Torneo gestionado en BagelsOnly Tijuana.' }}
        </p>

        <ion-item lines="none" style="--background: #f8f9fa; --border-radius: 12px; margin-bottom: 10px;">
          <ion-icon name="location-outline" slot="start" color="primary"></ion-icon>
          <ion-label>
            <p style="margin:0; font-size:0.8rem; color:#999;">Sede</p>
            <h3 style="font-weight: 700; color:#000; margin:0;">{{ torneo.basica?.sede || 'Club Tenis Tijuana' }}</h3>
          </ion-label>
        </ion-item>

        <ion-button expand="block" (click)="abrirInscripcion()" 
          style="--border-radius: 16px; height: 56px; font-weight: 850; margin-top: 25px; --box-shadow: 0 8px 16px rgba(56, 128, 255, 0.25);">
          INSCRIBIRME AHORA
        </ion-button>
      </div>
    </ion-content>
  `
})
class DetalleTorneoModal {
  private modalCtrl = inject(ModalController); torneo: any;
  cerrar() { this.modalCtrl.dismiss(); }
  abrirInscripcion() { if (this.torneo.link) window.open(this.torneo.link, '_blank'); }
}

// ==========================================================================
// 2. CLASE PRINCIPAL TAB1
// ==========================================================================

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderGlobalComponent, DragDropModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonBadge, IonText, 
    IonProgressBar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
    IonList, IonItem, IonLabel, IonButtons, IonSpinner, IonSelect, IonSelectOption, 
    IonInput, IonTextarea, IonModal, IonGrid, IonRow, IonCol, IonAvatar
  ]
})
export class Tab1Page implements OnInit {
  private modalCtrl = inject(ModalController);
  private firestore = inject(Firestore);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private rankingsService = inject(RankingsService);
  public authService = inject(AuthService);
  private injector = inject(EnvironmentInjector);
  private actionSheetCtrl = inject(ActionSheetController);

  isAdmin = false;
  isModalTorneoOpen = false;
  isModalEscaleraOpen = false;

  nuevoTorneo = {
    titulo: '',
    subhead: 'Individual',
    sede: 'Club Tenis Tijuana',
    descripcion: 'Torneo gestionado en BagelsOnly Tijuana.',
    modalidad: 'singles',
    sistema: 'rr-ko',
    victoria: 3,
    derrota: 0,
    esPrivado: false,
    permitirComentarios: true,
    colorLayout: 'rgba(235, 245, 255, 0.8)'
  };
  nuevaEscalera = { nombre: '', jugadores: 0, tuPosicion: '-', lider: 'Por definir', puntosLider: 0 };

  retosDisponibles: any[] = [];
  torneosProximos: any[] = [];
  escalerasActivas: any[] = [];

  constructor() {
    addIcons({ 
      calendarOutline, statsChart, trophy, arrowForwardOutline, informationCircleOutline, personAddOutline, heartOutline, closeOutline,
      checkmarkCircleOutline, flashOutline, locationOutline, timeOutline, tennisballOutline, peopleOutline, expandOutline, cashOutline, 
      listOutline, openOutline, saveOutline, star, medalOutline, trophyOutline, reorderTwoOutline, people, checkmarkCircle,
      addCircleOutline, statsChartOutline, tennisball, addCircle, trashOutline
    });
  }

  ngOnInit() { 
    this.rankingsService.usuarioActual$.subscribe((perfil: any) => {
      this.isAdmin = perfil?.roles?.isAdmin || false;
    });
    this.escucharColeccionesPublicas();
    this.escucharRetosDisponibles();
  }

  private escucharColeccionesPublicas() {
    runInInjectionContext(this.injector, () => {
      onSnapshot(query(collection(this.firestore, 'torneos'), orderBy('fechaCreacion', 'desc')), (snap) => {
        this.torneosProximos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
      onSnapshot(query(collection(this.firestore, 'escaleras_publicas'), orderBy('timestamp', 'desc')), (snap) => {
        this.escalerasActivas = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    });
  }

  private escucharRetosDisponibles() {
    runInInjectionContext(this.injector, () => {
      const q = query(collection(this.firestore, 'challenges'), where('estado', '==', 'Abierto'), orderBy('timestamp', 'desc'));
      onSnapshot(q, (snapshot) => {
        const ahora = new Date().getTime();
        this.retosDisponibles = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((reto: any) => reto.timestamp && (ahora - reto.timestamp.toDate().getTime()) < 172800000);
      });
    });
  }

  async publicarTorneo() {
    const uid = this.authService.currentUserId;
    if (!uid) return;

    try {
      const torneoData = {
        basica: {
          titulo: this.nuevoTorneo.titulo,
          subhead: this.nuevoTorneo.subhead,
          sede: this.nuevoTorneo.sede,
          descripcion: this.nuevoTorneo.descripcion,
          colorLayout: this.nuevoTorneo.colorLayout
        },
        creadorId: uid,
        estado: 'activo',
        fechaCreacion: serverTimestamp(),
        timestamp: serverTimestamp(), 
        jugadoresCount: 0,
        seguidoresCount: 0,
        modalidad: this.nuevoTorneo.modalidad,
        sistema: this.nuevoTorneo.sistema,
        privacidad: {
          esPrivado: this.nuevoTorneo.esPrivado,
          permitirComentarios: this.nuevoTorneo.permitirComentarios
        },
        puntos: {
          victoria: this.nuevoTorneo.victoria,
          derrota: this.nuevoTorneo.derrota
        }
      };

      await addDoc(collection(this.firestore, 'torneos'), torneoData);
      this.presentarToast('Torneo creado con éxito 🎾', 'success');
      this.isModalTorneoOpen = false;
      
      this.nuevoTorneo = { titulo: '', subhead: 'Individual', sede: 'Club Tenis Tijuana', descripcion: 'Torneo gestionado en BagelsOnly Tijuana.', modalidad: 'singles', sistema: 'rr-ko', victoria: 3, derrota: 0, esPrivado: false, permitirComentarios: true, colorLayout: 'rgba(235, 245, 255, 0.8)' };

    } catch (e) {
      console.error(e);
      this.presentarToast('Error al crear torneo', 'danger');
    }
  }

  async publicarEscalera() {
    try {
      await addDoc(collection(this.firestore, 'escaleras_publicas'), { 
        ...this.nuevaEscalera, 
        timestamp: serverTimestamp() 
      });
      this.presentarToast('Escalera publicada', 'success');
      this.isModalEscaleraOpen = false;
    } catch (e) { this.presentarToast('Error al publicar', 'danger'); }
  }

  async confirmarEliminacion(id: string, coleccion: string, nombre: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar evento?',
      message: `Estás a punto de borrar "${nombre}".`,
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteDoc(doc(this.firestore, `${coleccion}/${id}`));
              this.presentarToast('Eliminado correctamente', 'success');
            } catch (e) { this.presentarToast('Error al eliminar', 'danger'); }
          }
        }
      ]
    });
    await alert.present();
  }

  async seguirTorneo(torneo: any) {
    const uid = this.authService.currentUserId;
    if (!uid) return this.presentarToast('Inicia sesión para seguir torneos', 'warning');
    try {
      await updateDoc(doc(this.firestore, `perfiles/${uid}`), { 'social.torneosSeguidos': arrayUnion(torneo.id) });
      this.presentarToast(`Siguiendo a ${torneo.basica?.titulo || torneo.nombre} 🎾`, 'success');
    } catch (e) { this.presentarToast('Error al seguir torneo', 'danger'); }
  }

  async verTablaInscritos(torneo: any) {
    this.presentarToast('Cargando tabla de posiciones...', 'primary');
  }

  async aceptarReto(reto: any) {
    const uid = this.authService.currentUserId;
    if (!uid) { this.presentarToast('Inicia sesión para participar', 'warning'); return; }
    if (reto.retadorId === uid || reto.companeroId === uid) {
      this.presentarToast('Es tu propio reto', 'danger'); return;
    }
    if (reto.tipo === 'dobles') this.gestionarAceptacionDobles(reto);
    else this.confirmarMatchSencillos(reto);
  }

  private async confirmarMatchSencillos(reto: any) {
    runInInjectionContext(this.injector, async () => {
      try {
        const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${this.authService.currentUserId}`));
        const miNombre = miPerfilSnap.data()?.['infoBasica']?.nombre || 'Tenista AMT';
        await updateDoc(doc(this.firestore, `challenges/${reto.id}`), {
          estado: 'Aceptado', rivalId: this.authService.currentUserId, rivalNombre: miNombre, fechaAceptado: serverTimestamp()
        });
        this.presentarToast('¡Match aceptado! 🎾', 'success');
      } catch (error) { this.presentarToast('Error', 'danger'); }
    });
  }

  private async gestionarAceptacionDobles(reto: any) {
    const miUid = this.authService.currentUserId;
    const amigosRef = collection(this.firestore, `perfiles/${miUid}/amigos`);
    const snap = await getDocs(amigosRef);
    const misAmigos = snap.docs.map(d => ({ id: d.data()['uid'], nombre: d.data()['nombre'] }));
    if (misAmigos.length === 0) { this.presentarToast('Agrega amigos primero.', 'warning'); return; }
    const botones = misAmigos.map(amigo => ({ text: amigo.nombre, handler: () => this.finalizarRetoDobles(reto, amigo) }));
    botones.push({ text: 'Cancelar', role: 'cancel' } as any);
    const actionSheet = await this.actionSheetCtrl.create({ header: 'Pareja para el match', buttons: botones, mode: 'ios' });
    await actionSheet.present();
  }

  private async finalizarRetoDobles(reto: any, parejaElegida: any) {
    runInInjectionContext(this.injector, async () => {
      try {
        const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${this.authService.currentUserId}`));
        const miNombre = miPerfilSnap.data()?.['infoBasica']?.nombre || 'Tenista';
        await updateDoc(doc(this.firestore, `challenges/${reto.id}`), {
          estado: 'Aceptado', rivalId: this.authService.currentUserId, rivalNombre: miNombre,
          parejaRivalId: parejaElegida.id, parejaRivalNombre: parejaElegida.nombre, fechaAceptado: serverTimestamp()
        });
        this.presentarToast(`¡Match de dobles listo! 🎾`, 'success');
      } catch (e) { this.presentarToast('Error', 'danger'); }
    });
  }

  getTiempoRestante(t: any): string {
    if (!t) return 'TBD';
    const diff = (t.toDate().getTime() + 172800000) - new Date().getTime();
    return diff <= 0 ? 'Expirado' : `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  }

  formatearHistorial(h: any[]): string { return h?.length ? h.slice(-5).map(w => w ? 'W' : 'L').join('-') : 'N/A'; }

  async presentarToast(mensaje: string, color: string) {
    const t = await this.toastCtrl.create({ message: mensaje, duration: 2000, color: color, position: 'top', mode: 'ios' });
    t.present();
  }

  async irAEscalera(ladder: any) { 
    const modal = await this.modalCtrl.create({ component: DetalleLadderModal, componentProps: { ladder } }); 
    return await modal.present(); 
  }

  async irATorneo(torneo: any) { 
    const modal = await this.modalCtrl.create({ component: DetalleTorneoModal, componentProps: { torneo } }); 
    return await modal.present(); 
  }
}


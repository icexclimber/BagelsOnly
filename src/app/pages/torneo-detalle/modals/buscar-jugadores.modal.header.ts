import { Component, OnInit, inject, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, 
  IonSearchbar, IonList, IonItem, IonAvatar, IonLabel, IonIcon, IonNote,
  IonListHeader, IonBadge, ModalController, IonSkeletonText, IonSelect, IonSelectOption, IonInput, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  searchOutline, personAddOutline, chatbubbleEllipsesOutline, 
  trophyOutline, peopleOutline, addCircle, chevronForwardOutline,
  tennisballOutline, checkmarkCircle, eyeOutline, locationOutline,
  calendarOutline, timeOutline
} from 'ionicons/icons';
import { 
  Firestore, collection, query, orderBy, startAt, endAt, getDocs, limit, where, addDoc, serverTimestamp, doc, getDoc
} from '@angular/fire/firestore';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-buscar-jugadores-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonContent, IonSearchbar, IonList, IonItem, IonAvatar, 
    IonLabel, IonIcon, IonNote, IonListHeader, IonBadge, IonSkeletonText,
    IonSelect, IonSelectOption, IonInput, IonModal
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="modal-header-premium">
        <ion-title>Comunidad Tenística</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()" class="btn-cerrar">CERRAR</ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar class="modal-search-premium">
        <ion-searchbar 
          placeholder="Buscar por nombre..." 
          (ionInput)="buscarEnPlataforma($event)"
          [debounce]="400"
          mode="ios"
          class="custom-searchbar">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content class="comunidad-content-glass">
      
      <div class="ion-padding-horizontal ion-margin-top" *ngIf="buscando || usuariosBusqueda.length > 0">
        <ion-list-header class="glass-list-header">
          <ion-label>{{ buscando ? 'Buscando rivales...' : 'Resultados Globales' }}</ion-label>
        </ion-list-header>
        
        <ion-list lines="none" class="glass-list">
          <ng-container *ngIf="buscando">
            <ion-item *ngFor="let s of [1,2,3]" class="player-item">
              <ion-avatar slot="start"><ion-skeleton-text animated></ion-skeleton-text></ion-avatar>
              <ion-label><ion-skeleton-text animated style="width: 60%"></ion-skeleton-text></ion-label>
            </ion-item>
          </ng-container>

          <ion-item *ngFor="let user of usuariosBusqueda" class="player-item">
            <ion-avatar slot="start" class="glass-avatar">
              <img [src]="user.infoBasica?.fotoURL || 'https://ui-avatars.com/api/?name=' + user.infoBasica?.nombre" />
            </ion-avatar>
            <ion-label>
              <h2 class="user-name">{{ user.infoBasica?.nombre }}</h2>
              <p class="user-level">
                <ion-icon name="tennisball-outline" color="primary"></ion-icon>
                NTRP {{ user.infoBasica?.nivel || '1.0' }} | {{ user.infoBasica?.ubicacion }}
              </p>
            </ion-label>
            
            <ion-buttons slot="end">
              <ion-button (click)="verPerfilAmigo(user)" class="btn-action view-profile">
                <ion-icon name="chevron-forward-outline" slot="icon-only"></ion-icon>
              </ion-button>

              <div class="action-divider"></div>

              <ion-button (click)="seleccionarUsuario(user)" class="btn-action">
                <ion-icon name="person-add-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-list>
      </div>

      <div class="ion-padding-horizontal ion-margin-top">
        <ion-list-header class="glass-list-header">
          <ion-label>Mis Amigos</ion-label>
          <ion-icon name="people-outline" slot="end" class="header-icon"></ion-icon>
        </ion-list-header>

        <div *ngIf="amigos.length === 0 && !cargandoAmigos" class="empty-state ion-text-center ion-padding">
          <ion-icon name="people-outline" size="large" color="medium"></ion-icon>
          <p>Aún no tienes amigos confirmados.</p>
        </div>

        <ion-list lines="none" class="glass-list">
          <ion-item *ngFor="let amigo of amigos" class="friend-item" style="--inner-padding-end: 8px;">
            <ion-avatar slot="start" class="glass-avatar">
              <img [src]="amigo.foto || 'assets/img/default-avatar.png'" />
            </ion-avatar>
            
            <ion-label>
              <h2 class="user-name">{{ amigo.nombre }}</h2>
              <p class="user-status">Listo para un set</p>
            </ion-label>

            <ion-buttons slot="end">
              <ion-button (click)="verPerfilAmigo(amigo)" 
                          class="btn-action view-profile"
                          fill="clear">
                <ion-icon name="eye-outline" slot="icon-only"></ion-icon>
              </ion-button>
              
              <ion-button (click)="retarAMatch(amigo)" class="btn-action match" fill="clear">
                <ion-icon name="trophy-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-list>
      </div>

      <ion-modal [isOpen]="isModalRetoOpen" (didDismiss)="isModalRetoOpen = false" [initialBreakpoint]="0.65" [breakpoints]="[0, 0.65, 0.9]">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar class="modal-header-premium">
              <ion-title>Configurar Match</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="isModalRetoOpen = false" color="primary">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding comunidad-content-glass">
            <div class="ion-text-center ion-margin-bottom" *ngIf="amigoSeleccionado">
              <p style="color: rgba(255,255,255,0.6); margin-bottom: 4px;">Retando a:</p>
              <h2 style="color: #fff; font-weight: 800; margin-top: 0;">{{ amigoSeleccionado.nombre }}</h2>
            </div>
            <ion-list lines="none" class="glass-list">
              <ion-item class="player-item ion-margin-bottom">
                <ion-icon name="location-outline" slot="start" color="primary"></ion-icon>
                <ion-label position="stacked" style="color: #368dc7">Sede</ion-label>
                <ion-select [(ngModel)]="nuevoReto.sede" interface="popover" style="color: white">
                  <ion-select-option value="Club Campestre">Club Campestre</ion-select-option>
                  <ion-select-option value="Club Britania">Club Britania</ion-select-option>
                  <ion-select-option value="Playas de Tijuana">Playas de Tijuana</ion-select-option>
                  <ion-select-option value="Club Bancario">Club Bancario</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item class="player-item ion-margin-bottom">
                <ion-icon name="calendar-outline" slot="start" color="primary"></ion-icon>
                <ion-label position="stacked" style="color: #368dc7">Fecha</ion-label>
                <ion-select [(ngModel)]="nuevoReto.fecha" interface="popover" style="color: white">
                  <ion-select-option *ngFor="let dia of proximasFechas" [value]="dia.valor">{{ dia.label }}</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item class="player-item ion-margin-bottom">
                <ion-icon name="time-outline" slot="start" color="primary"></ion-icon>
                <ion-label position="stacked" style="color: #368dc7">Hora</ion-label>
                <ion-input type="time" [(ngModel)]="nuevoReto.hora" style="color: white"></ion-input>
              </ion-item>
              <ion-item class="player-item">
                <ion-icon name="tennisball-outline" slot="start" color="primary"></ion-icon>
                <ion-label position="stacked" style="color: #368dc7">Formato</ion-label>
                <ion-select [(ngModel)]="nuevoReto.formato" interface="popover" style="color: white">
                  <ion-select-option value="2 de 3 sets">2 de 3 sets</ion-select-option>
                  <ion-select-option value="Pro Set (8 games)">Pro Set (8 games)</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
            <button class="challenge-button-premium ion-margin-top" (click)="publicarReto()">LANZAR CHALLENGE</button>
          </ion-content>
        </ng-template>
      </ion-modal>

    </ion-content>
  `,
  styles: [`
    .modal-header-premium {
      --background: #ffffff;
      --color: #1a1a1a;
      ion-title { font-weight: 850; letter-spacing: 0.5px; }
    }
    .custom-searchbar {
      --background: #f4f5f8 !important;
      --border-radius: 12px;
      padding: 8px 16px;
      color: #333 !important;
    }
    .comunidad-content-glass {
      --background: #0b0e14;
    }
    .glass-list-header {
      background: transparent;
      ion-label {
        color: #368dc7 !important;
        font-weight: 800;
        text-transform: uppercase;
        font-size: 0.75rem;
      }
    }
    .player-item, .friend-item { 
      --background: rgba(255, 255, 255, 0.05); 
      --border-radius: 16px; 
      margin-bottom: 8px;
      --padding-start: 12px;
      .user-name { font-weight: 700; color: white; }
      .user-level { color: #368dc7; font-size: 0.8rem; display: flex; align-items: center; gap: 4px; }
      .user-status { color: #c1dd7f; font-size: 0.8rem; }
    }
    .glass-avatar {
      border: 1px solid rgba(54, 141, 199, 0.3);
      background: rgba(255, 255, 255, 0.1);
    }
    .btn-action {
      --color: #ffffff;
      &.match { --color: #ffc409; }
      &.view-profile { --color: #368dc7; }
    }
    .action-divider {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 4px;
    }
    .empty-state {
      color: #666;
      ion-icon { font-size: 3rem; margin-bottom: 10px; }
    }
    .challenge-button-premium {
      width: 100%;
      background: linear-gradient(135deg, #368dc7 0%, #212e4a 100%);
      color: white;
      padding: 16px;
      border-radius: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      border: none;
      box-shadow: 0 4px 15px rgba(54, 141, 199, 0.3);
    }
  `]
})
export class BuscarJugadoresModalHeader implements OnInit {
  private modalCtrl = inject(ModalController);
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private authService = inject(AuthService);
  
  usuariosBusqueda: any[] = [];
  amigos: any[] = [];
  cargandoAmigos = false;
  buscando = false;

  // Propiedades para el Reto
  isModalRetoOpen = false;
  amigoSeleccionado: any = null;
  nuevoReto = {
    sede: 'Club Bancario',
    fecha: '',
    hora: '08:00',
    formato: '2 de 3 sets',
    rivalId: ''
  };
  proximasFechas: any[] = [];

  constructor() {
    addIcons({ 
      searchOutline, personAddOutline, chatbubbleEllipsesOutline, 
      trophyOutline, peopleOutline, addCircle, chevronForwardOutline,
      tennisballOutline, checkmarkCircle, eyeOutline, locationOutline,
      calendarOutline, timeOutline
    });
    this.generarProximasFechas();
  }

  ngOnInit() {
    this.cargarAmigos();
  }

  generarProximasFechas() {
    const fechas = [];
    const dias = ['Hoy', 'Mañana'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      fechas.push({
        label: i < 2 ? dias[i] : d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }),
        valor: d.toISOString().split('T')[0]
      });
    }
    this.proximasFechas = fechas;
    this.nuevoReto.fecha = fechas[0].valor;
  }

  async cargarAmigos() {
    const miUid = this.authService.currentUserId;
    if (!miUid) return;

    this.cargandoAmigos = true;
    try {
      const misAmigosRef = collection(this.firestore, `perfiles/${miUid}/amigos`);
      const snapshot = await getDocs(misAmigosRef);
      
      this.amigos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data['uid'],
          nombre: data['nombre'],
          foto: data['fotoURL'] || 'assets/img/default-avatar.png'
        };
      });
    } catch (e) {
      console.error("❌ Error cargando amigos:", e);
    } finally {
      this.cargandoAmigos = false;
    }
  }

  // --- LÓGICA DE CHALLENGE DIRECTO ---
  retarAMatch(amigo: any) {
    this.amigoSeleccionado = amigo;
    this.nuevoReto.rivalId = amigo.id;
    this.isModalRetoOpen = true;
  }

  async publicarReto() {
    const miUid = this.authService.currentUserId;
    if (!miUid || !this.nuevoReto.rivalId) return;

    try {
      // 1. Datos del retador
      const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${miUid}`));
      const miData = miPerfilSnap.data();
      const miNombre = miData?.['infoBasica']?.nombre || 'Tenista';

      // 2. Crear Challenge
      const challengeRef = collection(this.firestore, 'challenges');
      const nuevoDoc = await addDoc(challengeRef, {
        retadorId: miUid,
        rivalId: this.nuevoReto.rivalId,
        sede: this.nuevoReto.sede,
        fecha: this.nuevoReto.fecha,
        hora: this.nuevoReto.hora,
        formato: this.nuevoReto.formato,
        estado: 'Pendiente',
        fechaCreacion: serverTimestamp(),
        nombreRetador: miNombre
      });

      // 3. Notificación al rival
      const notifRef = collection(this.firestore, `usuarios/${this.nuevoReto.rivalId}/notificaciones`);
      await addDoc(notifRef, {
        tipo: 'challenge',
        status: 'pendiente',
        de: miUid,
        nombreEmisor: miNombre,
        fotoEmisor: miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png',
        mensaje: `Te ha retado a un match en ${this.nuevoReto.sede}`,
        challengeId: nuevoDoc.id,
        fecha: serverTimestamp()
      });

      this.isModalRetoOpen = false;
      this.modalCtrl.dismiss({ success: true, msg: 'Challenge enviado' });
    } catch (e) {
      console.error("Error al lanzar challenge:", e);
    }
  }

  async buscarEnPlataforma(event: any) {
    const term = event.detail.value?.toLowerCase().trim(); 
    if (!term || term.length < 2) { 
      this.usuariosBusqueda = []; 
      this.buscando = false;
      return; 
    }

    this.buscando = true;
    runInInjectionContext(this.injector, async () => {
      try {
        const perfilesRef = collection(this.firestore, 'perfiles');
        const q = query(
          perfilesRef,
          orderBy('infoBasica.nombreLower'),
          startAt(term),
          endAt(term + '\uf8ff'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        this.usuariosBusqueda = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== this.authService.currentUserId);
      } catch (e) {
        console.error('Error en búsqueda:', e);
      } finally {
        this.buscando = false;
      }
    });
  }

  verPerfilAmigo(amigo: any) {
    if (!amigo || !amigo.id) return;
    this.modalCtrl.dismiss({ usuario: amigo, accion: 'ver' });
  }

  seleccionarUsuario(usuario: any) {
    this.modalCtrl.dismiss({ usuario, accion: 'agregar' });
  }

  cerrar() { this.modalCtrl.dismiss(); }
}
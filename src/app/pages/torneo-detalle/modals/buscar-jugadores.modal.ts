import { Component, OnInit, inject, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, 
  IonSearchbar, IonList, IonItem, IonAvatar, IonLabel, IonIcon, IonNote,
  IonListHeader, IonBadge, ModalController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, layersOutline, trashOutline, searchOutline, personAddOutline, addCircleOutline } from 'ionicons/icons';
import { 
  Firestore, collection, query, orderBy, startAt, endAt, getDocs, limit 
} from '@angular/fire/firestore';

@Component({
  selector: 'app-buscar-jugadores-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonContent, IonSearchbar, IonList, IonItem, IonAvatar, 
    IonLabel, IonIcon, IonNote, IonListHeader, IonBadge
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Jugadores y Grupos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar color="primary">
        <ion-searchbar 
          placeholder="Buscar por nombre..." 
          (ionInput)="buscarEnPlataforma($event)"
          [debounce]="500"
          animated="true">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <div *ngIf="usuariosBusqueda.length > 0">
        <ion-list-header>
          <ion-label color="success">Usuarios encontrados</ion-label>
        </ion-list-header>
        <ion-list lines="none">
          <ion-item *ngFor="let user of usuariosBusqueda" class="player-item ion-margin-bottom">
            <ion-avatar slot="start">
              <img [src]="user.photoURL || 'https://ionicframework.com/docs/img/demos/avatar.svg'" />
            </ion-avatar>
            <ion-label>
              <h2>{{ user.nombre }}</h2>
              <p>{{ user.nivel || 'Nivel no definido' }} - Tijuana</p>
            </ion-label>
            <ion-button slot="end" fill="clear" (click)="seleccionarUsuario(user)">
              <ion-icon name="add-circle" color="success" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <div *ngIf="usuariosBusqueda.length === 0" class="ion-text-center ion-padding" style="margin-top: 20px;">
        <ion-icon name="search-outline" style="font-size: 3rem; opacity: 0.2;"></ion-icon>
        <p class="text-muted" style="font-size: 0.9rem;">
          Escribe el nombre del tenista.<br>
          <small>(Recuerda usar mayúsculas si el nombre comienza con una)</small>
        </p>
      </div>

      <ion-list-header class="ion-margin-top">
        <ion-label>ORGANIZACIÓN POR GRUPOS</ion-label>
        <ion-button size="small" fill="clear" (click)="crearGrupo()">+ Grupo</ion-button>
      </ion-list-header>

      <div *ngFor="let grupo of grupos" class="grupo-card ion-margin-bottom">
        <ion-item lines="none" class="grupo-header">
          <ion-icon name="layers-outline" slot="start"></ion-icon>
          <ion-label>{{ grupo.nombre }}</ion-label>
          <ion-badge slot="end" color="light">{{ grupo.jugadores.length }}</ion-badge>
        </ion-item>
        
        <ion-list lines="inset">
          <ion-item *ngFor="let p of grupo.jugadores">
            <ion-label>{{ p.nombre }}</ion-label>
            <ion-button slot="end" fill="clear" color="danger" (click)="removerDeGrupo(grupo, p)">
              <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
            </ion-button>
          </ion-item>
          <ion-item *ngIf="grupo.jugadores.length === 0">
            <ion-note style="padding-left: 10px;">Sin jugadores asignados</ion-note>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [`
    .player-item { 
      --background: rgba(255,255,255,0.05); 
      --border-radius: 12px; 
      margin-bottom: 8px;
    }
    .grupo-card { 
      background: #1c1f26; 
      border-radius: 15px; 
      overflow: hidden; 
      border: 1px solid rgba(255,255,255,0.05);
      margin-bottom: 16px;
    }
    .grupo-header { 
      --background: rgba(112, 68, 255, 0.15); 
      font-weight: bold; 
      --color: white;
    }
  `]
})
export class BuscarJugadoresModal implements OnInit {
  private modalCtrl = inject(ModalController);
  private firestore = inject(Firestore);
  private injector = inject(Injector); 
  
  usuariosBusqueda: any[] = [];
  grupos: any[] = [{ id: '1', nombre: 'Grupo A', jugadores: [] }];

  constructor() {
    addIcons({ addCircle, layersOutline, trashOutline, searchOutline, personAddOutline, addCircleOutline });
  }

  ngOnInit() {}

  async buscarEnPlataforma(event: any) {
    const term = event.detail.value; 
    
    // Si hay menos de 2 letras, limpiamos la lista
    if (!term || term.trim().length < 2) { 
      this.usuariosBusqueda = []; 
      return; 
    }

    runInInjectionContext(this.injector, async () => {
      try {
        // CAMBIO: Ahora consultamos la colección 'perfiles'
        const perfilesRef = collection(this.firestore, 'perfiles');
        
        // CAMBIO: Ordenamos y buscamos por el campo 'nombre'
        const q = query(
          perfilesRef,
          orderBy('nombre'),
          startAt(term),
          endAt(term + '\uf8ff'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        this.usuariosBusqueda = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        console.log('Perfiles encontrados:', this.usuariosBusqueda.length);
      } catch (e) {
        console.error('Error en búsqueda:', e);
      }
    });
  }

  seleccionarUsuario(usuario: any) {
    // Al seleccionar, cerramos el modal y pasamos el usuario al padre (torneo-detalle)
    this.modalCtrl.dismiss({ usuario, accion: 'agregar' });
  }

  crearGrupo() {
    const letra = String.fromCharCode(65 + this.grupos.length);
    this.grupos.push({ id: Date.now().toString(), nombre: `Grupo ${letra}`, jugadores: [] });
  }

  removerDeGrupo(grupo: any, jugador: any) {
    grupo.jugadores = grupo.jugadores.filter((p: any) => p.id !== jugador.id);
  }

  cerrar() { this.modalCtrl.dismiss(); }
}
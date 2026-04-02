import { Component, OnInit, inject, OnDestroy, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, 
  IonCardSubtitle, IonCardContent, IonBadge, IonIcon, IonNote, 
  IonButton, IonFab, IonFabButton, IonModal, IonSearchbar, IonToggle, IonInput,
  AlertController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  add, trophyOutline, chevronForwardOutline, personOutline, 
  layersOutline, arrowBack, peopleOutline, gitNetworkOutline,
  flashOutline, flameOutline, eyeOutline, copyOutline, trashOutline,
  closeOutline, saveOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// FIREBASE & SERVICES
import { 
  Firestore, collection, addDoc, query, 
  where, onSnapshot, orderBy, doc, deleteDoc 
} from '@angular/fire/firestore';
import { RankingsService } from '../../core/services/rankings.service';

@Component({
  selector: 'app-mis-torneos',
  templateUrl: './mis-torneos.page.html',
  styleUrls: ['./mis-torneos.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonCard, 
    IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
    IonBadge, IonIcon, IonNote, IonButton, IonFab, IonFabButton, 
    IonModal, IonSearchbar, IonToggle, IonInput
  ]
})
export class MisTorneosPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private firestore = inject(Firestore);
  private rankingsService = inject(RankingsService);
  private alertCtrl = inject(AlertController);
  private injector = inject(Injector);
  private subscripcion = new Subscription();

  // PROPIEDADES DE USUARIO
  usuarioLoggeado: any = null;
  nombreSaludo: string = 'Organizador'; 

  // PROPIEDADES DE TORNEOS
  misTorneos: any[] = []; 
  isModalCrearOpen = false;
  isModalClonarOpen = false; 
  pasoActual = 1;

  configWizard = { formato: '', modalidad: '', sistema: '' };

  torneoAClonar: any = null;
  opcionesClonacion = {
    nuevoNombre: '',
    mantenerSeguidores: false,
    copiarJugadores: true,
    copiarEncuentros: false,
    cambiarACategorias: false
  };

  constructor() {
    addIcons({ 
      add, trophyOutline, chevronForwardOutline, personOutline, 
      layersOutline, arrowBack, peopleOutline, gitNetworkOutline,
      flashOutline, flameOutline, eyeOutline, copyOutline, trashOutline,
      closeOutline, saveOutline
    });
  }

 ngOnInit() {
    this.subscripcion.add(
      this.rankingsService.usuarioActual$.subscribe(user => {
        // Guardamos el objeto completo (que ahora tiene infoBasica, stats, etc.)
        this.usuarioLoggeado = user;
        
        if (user && user.infoBasica) {
          // CORRECCIÓN: Acceso a través del mapa infoBasica
          const nombreCompleto = user.infoBasica.nombre;
          this.nombreSaludo = nombreCompleto ? nombreCompleto.split(' ')[0] : 'Organizador';
          
          this.cargarTorneosDelUsuario(user.uid);
        } else {
          this.nombreSaludo = 'Organizador';
          this.misTorneos = [];
        }
      })
    );
  }

  cargarTorneosDelUsuario(uid: string) {
    runInInjectionContext(this.injector, () => {
      const torneosRef = collection(this.firestore, 'torneos');
      const q = query(
        torneosRef, 
        where('creadorId', '==', uid),
        orderBy('fechaCreacion', 'desc')
      );

      onSnapshot(q, (snapshot) => {
        this.misTorneos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }, (error) => {
        console.error('❌ Error al leer torneos:', error);
      });
    });
  }

  async confirmarEliminacion(torneoId: string, nombreTorneo: string) {
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar Torneo?',
      message: `Estás a punto de borrar "${nombreTorneo}". Esta acción no se puede deshacer.`,
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await deleteDoc(doc(this.firestore, `torneos/${torneoId}`));
          }
        }
      ]
    });
    await alert.present();
  }

  abrirClonacion(torneo: any) {
    this.torneoAClonar = torneo;
    const nombreActual = torneo.basica?.titulo || torneo.nombre || 'Torneo';
    
    this.opcionesClonacion = {
      nuevoNombre: `${nombreActual} (Copia)`,
      mantenerSeguidores: false,
      copiarJugadores: true,
      copiarEncuentros: false,
      cambiarACategorias: torneo.basica?.formato === 'categorias' || torneo.formato === 'categorias'
    };
    this.isModalClonarOpen = true;
  }

  async confirmarClonacion() {
    if (!this.usuarioLoggeado || !this.torneoAClonar) return;

    const { id, ...datosBase } = this.torneoAClonar;

    const torneoClonado = {
      ...datosBase,
      creadorId: this.usuarioLoggeado.uid,
      fechaCreacion: new Date(),
      estado: 'activo',
      basica: {
        ...datosBase.basica,
        titulo: this.opcionesClonacion.nuevoNombre,
        // Al clonar, nos aseguramos de que herede el nuevo estilo visual
        colorLayout: 'rgba(235, 245, 255, 0.8)'
      },
      seguidoresCount: this.opcionesClonacion.mantenerSeguidores ? (this.torneoAClonar.seguidoresCount || 0) : 0,
      jugadoresCount: this.opcionesClonacion.copiarJugadores ? (this.torneoAClonar.jugadoresCount || 0) : 0
    };

    try {
      await addDoc(collection(this.firestore, 'torneos'), torneoClonado);
      this.isModalClonarOpen = false;
    } catch (e) {
      console.error("Error al clonar:", e);
    }
  }

  comenzarNuevoTorneo() {
    this.pasoActual = 1;
    this.configWizard = { formato: '', modalidad: '', sistema: '' };
    this.isModalCrearOpen = true;
  }

  setFormato(valor: string) {
    this.configWizard.formato = valor;
    this.pasoActual = 2;
  }

  setModalidad(valor: string) {
    this.configWizard.modalidad = valor;
    this.pasoActual = 3;
  }

  async setSistema(valor: string) {
    if (!this.usuarioLoggeado) return;
    this.configWizard.sistema = valor;
    
    const nuevoTorneo = {
      creadorId: this.usuarioLoggeado.uid,
      fechaCreacion: new Date(),
      estado: 'activo',
      modalidad: this.configWizard.modalidad,
      sistema: this.configWizard.sistema,
      jugadoresCount: 0,
      seguidoresCount: 0,
      basica: {
        titulo: `Torneo ${this.configWizard.formato === 'categorias' ? 'Categorías' : 'Open'} ${this.misTorneos.length + 1}`,
        subhead: this.configWizard.modalidad === 'singles' ? 'Individual' : 'Dobles',
        descripcion: 'Torneo gestionado en BagelsOnly Tijuana.',
        // ACTUALIZACIÓN: Color oficial Azul Traslúcido para nuevos torneos
        colorLayout: 'rgba(235, 245, 255, 0.8)', 
        sede: 'Club Tenis Tijuana'
      },
      puntos: { victoria: 3, derrota: 0 },
      privacidad: { permitirComentarios: true, esPrivado: false }
    };

    try {
      const docRef = await addDoc(collection(this.firestore, 'torneos'), nuevoTorneo);
      this.isModalCrearOpen = false;
      this.router.navigate(['/torneo-detalle', docRef.id]);
    } catch (e) {
      console.error("Error al crear:", e);
    }
  }

  verDetalles(id: string) {
    this.router.navigate(['/torneo-detalle', id]);
  }

  ngOnDestroy() {
    this.subscripcion.unsubscribe();
  }
}
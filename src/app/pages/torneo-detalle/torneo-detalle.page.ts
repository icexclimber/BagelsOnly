import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, 
  IonBackButton, IonSegment, IonSegmentButton, IonLabel, IonIcon,
  IonList, IonItem, IonAvatar, IonButton, IonFab, IonFabButton,
  IonCard, IonBadge, IonInput, IonNote, IonModal, IonToggle, 
  IonTextarea, IonListHeader, LoadingController, ToastController, 
  AlertController, ModalController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, calendarOutline, peopleOutline, statsChartOutline, 
  chatbubbleEllipsesOutline, heartOutline, heart, shareSocialOutline, 
  addOutline, personAddOutline, cameraOutline, trophyOutline, 
  settingsOutline, colorPaletteOutline, shieldCheckmarkOutline, 
  lockClosedOutline, printOutline, golfOutline, barbellOutline,
  locationOutline, trashOutline, gitNetworkOutline
} from 'ionicons/icons';

// Importación del archivo separado
import { BuscarJugadoresModal } from './modals/buscar-jugadores.modal';

// Firebase
import { Firestore, doc, docData, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-torneo-detalle',
  templateUrl: './torneo-detalle.page.html',
  styleUrls: ['./torneo-detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButtons, IonBackButton, IonSegment, IonSegmentButton, 
    IonLabel, IonIcon, IonList, IonItem, IonAvatar, IonButton,
    IonFab, IonFabButton, IonCard, IonBadge, IonInput, IonNote,
    IonModal, IonToggle, IonTextarea, IonListHeader
  ]
})
export class TorneoDetallePage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestore = inject(Firestore);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private modalCtrl = inject(ModalController); // Inyectamos el controlador de modales
  
  torneoId: string | null = null;
  segmentoActual: string = 'home'; 
  siguiendo: boolean = false; 
  isModalConfigOpen: boolean = false;
  
  private subscripcionTorneo = new Subscription();

  configTorneo: any = {
    basica: { titulo: '', subhead: '', descripcion: '', fechaInicio: '', fechaFinal: '', colorLayout: '#7044ff', sede: '' },
    puntos: { victoria: 3, derrota: 0 },
    privacidad: { permitirComentarios: true, esPrivado: false }
  };

  constructor() {
    addIcons({ 
      homeOutline, calendarOutline, peopleOutline, statsChartOutline, 
      chatbubbleEllipsesOutline, heartOutline, heart, shareSocialOutline, 
      addOutline, personAddOutline, cameraOutline, trophyOutline, 
      settingsOutline, colorPaletteOutline, shieldCheckmarkOutline, 
      lockClosedOutline, printOutline, golfOutline, barbellOutline,
      locationOutline, trashOutline, gitNetworkOutline
    });
  }

  ngOnInit() {
    this.torneoId = this.route.snapshot.paramMap.get('id');
    if (this.torneoId) { this.cargarDatosTorneo(); }
  }

  cargarDatosTorneo() {
    const torneoRef = doc(this.firestore, `torneos/${this.torneoId}`);
    this.subscripcionTorneo = docData(torneoRef).subscribe((data: any) => {
      if (data) { this.configTorneo = { ...this.configTorneo, ...data }; }
    });
  }

  async guardarConfiguracionMaestra() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    try {
      const torneoRef = doc(this.firestore, `torneos/${this.torneoId}`);
      await updateDoc(torneoRef, { ...this.configTorneo });
      this.isModalConfigOpen = false;
      this.presentToast('Cambios guardados', 'success');
    } catch (e) {
      this.presentToast('Error al guardar', 'danger');
    } finally {
      loading.dismiss();
    }
  }

  // --- NUEVA LÓGICA PARA EL MODAL SEPARADO ---
  async agregarJugador() {
    const modal = await this.modalCtrl.create({
      component: BuscarJugadoresModal,
      initialBreakpoint: 0.85,
      breakpoints: [0, 0.5, 0.85, 1],
      cssClass: 'modal-jugadores-custom' // Opcional por si quieres darle estilos en global.scss
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    // Si el modal devolvió un usuario para agregar
    if (data && data.accion === 'agregar') {
      this.inscribirJugadorFirestore(data.usuario);
    }
  }

  async inscribirJugadorFirestore(usuario: any) {
    if (!this.torneoId) return;

    try {
      const torneoRef = doc(this.firestore, `torneos/${this.torneoId}`);
      // Agregamos el ID del usuario al array de inscritos para evitar duplicados
      await updateDoc(torneoRef, {
        jugadoresInscritos: arrayUnion(usuario.id)
      });
      this.presentToast(`@${usuario.username} se ha inscrito al torneo`, 'success');
    } catch (e) {
      console.error(e);
      this.presentToast('Error al inscribir al jugador', 'danger');
    }
  }

  // --- BOTONES DE GESTIÓN ---
  irAGestionar(seccion: string) {
    if (seccion === 'jugadores') {
      this.isModalConfigOpen = false; // Cerramos el de ajustes
      this.agregarJugador(); // Abrimos el de búsqueda
    } else {
      this.router.navigate([`/torneo-gestion`, this.torneoId, seccion]);
      this.isModalConfigOpen = false;
    }
  }

  async imprimirReporte(tipo: string) {
    const alert = await this.alertCtrl.create({
      header: 'Generar Reporte',
      message: `¿Deseas preparar el documento de "${tipo}" para imprimir?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Generar',
          handler: () => { window.print(); }
        }
      ]
    });
    await alert.present();
  }

  async compartirTorneo() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.configTorneo.basica.titulo,
          text: this.configTorneo.basica.descripcion,
          url: window.location.href
        });
      } catch (e) { console.log('Error al compartir', e); }
    } else {
      this.presentToast('Enlace copiado al portapapeles', 'primary');
    }
  }

  generarMatches() {
    this.presentToast('Algoritmo de cruces iniciado...', 'secondary');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000, color, position: 'bottom' });
    await toast.present();
  }

  cambiarSegmento(event: any) { this.segmentoActual = event.detail.value; }
  
  toggleSeguir() { 
    this.siguiendo = !this.siguiendo; 
    this.presentToast(this.siguiendo ? 'Siguiendo torneo' : 'Dejaste de seguir', 'primary');
  }

  ngOnDestroy() { this.subscripcionTorneo.unsubscribe(); }
}
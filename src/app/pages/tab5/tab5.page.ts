import { Component, OnInit, inject, EnvironmentInjector, runInInjectionContext, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilTennis } from '../../models/perfil.model';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
  IonText, IonIcon, IonProgressBar, IonList, IonItem, IonLabel,
  IonAvatar, IonButton, IonBadge, IonSegment, IonSegmentButton, 
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonNote, IonListHeader, 
  ToastController, IonSpinner, IonButtons, IonModal, LoadingController, ActionSheetController 
} from '@ionic/angular/standalone';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Firestore, doc, onSnapshot, updateDoc, collection, query, where, deleteDoc, getDoc } from '@angular/fire/firestore'; 
import { Share } from '@capacitor/share';

import { addIcons } from 'ionicons';
import { 
  camera, cameraOutline, star, locationOutline, trophy, trophyOutline, 
  cloudUploadOutline, medalOutline, fitnessOutline, personOutline,
  settingsOutline, logOutOutline, flame, shareSocialOutline, closeOutline, 
  shareOutline, trendingUp, trendingUpOutline, flash, arrowForwardCircle,
  people, trashOutline, peopleCircleOutline, tennisball, checkmarkCircle
} from 'ionicons/icons';

import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, 
    IonText, IonIcon, IonProgressBar, IonList, IonItem, IonLabel,
    IonAvatar, IonButton, IonBadge, IonSegment, IonSegmentButton,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonNote, IonListHeader, 
    IonSpinner, IonButtons, IonModal, NgOptimizedImage
  ]
})
export class Tab5Page implements OnInit, OnDestroy { 
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private injector = inject(EnvironmentInjector);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  @ViewChild('modalResumenPremium') modalResumen!: IonModal;

  private profileUnsub?: () => void; 
  private teamsUnsub?: () => void; 
  private authSub?: Subscription;

  segmentoActual: string = 'stats';
  nombreMesActual: string = '';
  diasDelMes: any[] = [];
  
  torneosInscritos: any[] = []; 
  winRate: number = 0;
  misEquipos: any[] = [];

  // --- ACTUALIZADO: Perfil con statsDobles ---
  perfil: any = {
    id: '',
    infoBasica: { nombre: '', fotoURL: '', nivel: '1.0', bio: '', ubicacion: '' },
    stats: { puntos: 0, partidos: 0, victorias: 0, derrotas: 0, streak: 0, bestStreak: 0 },
    statsDobles: { victorias: 0, derrotas: 0, partidos: 0, winRate: 0, mejorPartner: 'Sin pareja', fotoPartner: '', matchesJuntos: 0 },
    bentoUI: { actividadMensual: [], historiaChallenges: [], topPercentil: 0, progresoRango: 0 }
  };

  constructor() {
    addIcons({ 
      camera, cameraOutline, star, locationOutline, trophy, trophyOutline, 
      cloudUploadOutline, medalOutline, fitnessOutline, personOutline,
      settingsOutline, logOutOutline, flame, shareSocialOutline, closeOutline, 
      shareOutline, trendingUp, trendingUpOutline, flash, arrowForwardCircle,
      people, trashOutline, peopleCircleOutline, tennisball, checkmarkCircle
    });
  }

  ngOnInit() {
    this.authSub = this.authService.user$.subscribe(user => {
      if (user) { 
        this.escucharPerfilEnTiempoReal(user.uid); 
        this.escucharMisEquipos(user.uid); 
      }
    });
  }

  escucharPerfilEnTiempoReal(uid: string) {
    runInInjectionContext(this.injector, () => {
      const docRef = doc(this.firestore, `perfiles/${uid}`);
      
      this.profileUnsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Cálculo de Win Rate Global
          const vics = data['stats']?.victorias ?? 0;
          const total = data['stats']?.partidos ?? 0;
          this.winRate = total > 0 ? Math.round((vics / total) * 100) : 0;

          // Sincronización completa incluyendo statsDobles
          this.perfil = { 
            ...this.perfil, 
            ...data
          };

          this.generarCalendarioMensual(data['bentoUI']?.actividadMensual ?? []);
        }
      });
    });
  }

  escucharMisEquipos(uid: string) {
    runInInjectionContext(this.injector, () => {
      const equiposRef = collection(this.firestore, 'equipos');
      const q = query(equiposRef, where('jugadores', 'array-contains', uid));

      this.teamsUnsub = onSnapshot(q, (snapshot) => {
        this.misEquipos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });
    });
  }

  async disolverEquipo(equipoId: string) {
    const loading = await this.loadingCtrl.create({ message: 'Disolviendo pareja...', mode: 'ios' });
    await loading.present();
    try {
      await deleteDoc(doc(this.firestore, `equipos/${equipoId}`));
      await loading.dismiss();
      this.presentarToast('Equipo disuelto correctamente', 'success');
    } catch (e) {
      await loading.dismiss();
      this.presentarToast('Error al disolver el equipo', 'danger');
    }
  }

  // --- MÉTODOS DE APOYO (Sin cambios) ---
  generarCalendarioMensual(diasActivos: any[]) {
    const ahora = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.nombreMesActual = meses[ahora.getMonth()];
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getDay();
    const totalDias = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
    const hoy = ahora.getDate();
    const temp = [];
    for (let i = 0; i < primerDia; i++) temp.push({ vacio: true });
    for (let d = 1; d <= totalDias; d++) {
      temp.push({ numero: d, activo: diasActivos.includes(d), esHoy: d === hoy, vacio: false });
    }
    this.diasDelMes = temp;
  }

  async cambiarFoto() {
    const uid = this.authService.currentUserId;
    if (!uid) return;
    try {
      const image = await Camera.getPhoto({
        quality: 70, allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });
      if (image?.base64String) {
        const loading = await this.loadingCtrl.create({ message: 'Subiendo...', mode: 'ios' });
        await loading.present();
        const storageRef = ref(this.storage, `perfiles/${uid}/foto.jpg`);
        await uploadString(storageRef, image.base64String, 'base64', { contentType: 'image/jpeg' });
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(this.firestore, `perfiles/${uid}`), { 'infoBasica.fotoURL': url });
        await loading.dismiss();
        this.presentarToast('¡Foto actualizada!', 'success');
      }
    } catch (e) { this.loadingCtrl.dismiss(); }
  }

  async guardarCambios() {
    const uid = this.authService.currentUserId;
    if (!uid) return;
    const loading = await this.loadingCtrl.create({ message: 'Guardando...', mode: 'ios' });
    await loading.present();
    try {
      await updateDoc(doc(this.firestore, `perfiles/${uid}`), {
        'infoBasica.nombre': this.perfil.infoBasica.nombre,
        'infoBasica.bio': this.perfil.infoBasica.bio,
        'infoBasica.nivel': this.perfil.infoBasica.nivel,
        'infoBasica.ubicacion': this.perfil.infoBasica.ubicacion,
        'infoBasica.manoDominante': this.perfil.infoBasica.manoDominante
      });
      this.segmentoActual = 'stats';
      await loading.dismiss();
      this.presentarToast('¡Perfil actualizado!', 'success');
    } catch (e) { 
      await loading.dismiss();
      this.presentarToast('Error al guardar', 'danger'); 
    }
  }

  abrirModalResumen() { if (this.modalResumen) this.modalResumen.present(); }
  async compartirNativo() {
    try {
      await Share.share({
        title: 'Mi Racha en BagelsOnly',
        text: `Llevo ${this.perfil.stats.streak} días entrenando.`,
        url: 'https://bagelsonly.app'
      });
    } catch (e) {}
  }
  async presentarToast(m: string, c: string) {
    const t = await this.toastCtrl.create({ message: m, color: c, duration: 2000, mode: 'ios' });
    await t.present();
  }
  async logout() { await this.authService.logout(); }

  ngOnDestroy() {
    if (this.profileUnsub) this.profileUnsub();
    if (this.teamsUnsub) this.teamsUnsub();
    if (this.authSub) this.authSub.unsubscribe();
  }
}
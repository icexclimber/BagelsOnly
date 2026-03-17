import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, 
  IonBadge, IonProgressBar, IonSegment, IonSegmentButton, IonLabel, 
  IonGrid, IonRow, IonCol, IonIcon, IonButton, IonPopover,
  IonList, IonItem, IonSpinner,
  LoadingController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cameraReverse, trophy, checkmarkCircle, saveOutline, star, lockClosed, flash, flame, skull
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { RankingsService, PerfilTenista } from '../../core/services/rankings.service';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonCard, IonCardContent, 
    IonBadge, IonProgressBar, IonSegment, IonSegmentButton, IonLabel, 
    IonGrid, IonRow, IonCol, IonIcon, IonButton, IonPopover,
    IonList, IonItem, IonSpinner
  ]
})
export class Tab1Page implements OnInit {
  private rankingsService = inject(RankingsService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  // Observable conectado al stream de datos de Firebase
  usuarioActual$: Observable<PerfilTenista | null> = this.rankingsService.usuarioActual$;
  
  segmentoActual: string = 'stats';
  bannerDefault: string = 'linear-gradient(135deg, #0f1115 0%, #282c35 100%)';

  /**
   * 🎮 Colección de Banners estilo Videojuego
   * Puedes usar rutas de imágenes (assets/...) o degradados CSS
   */
  listaBanners = [
    { 
      id: 'b1', nombre: 'Novato AMT', icono: 'star', nivelRequerido: 1, 
      imagenBanner: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      leyenda: 'Bienvenido a la red. Se otorga al completar tu registro.' 
    },
    { 
      id: 'b2', nombre: 'Club Tijuana', icono: 'trophy', nivelRequerido: 3, 
      imagenBanner: 'assets/banners/tijuana-city.jpg', 
      leyenda: 'Representante local. Desbloqueado al alcanzar el Nivel 3.' 
    },
    { 
      id: 'b3', nombre: 'Servicio Veloz', icono: 'flash', nivelRequerido: 5, 
      imagenBanner: 'linear-gradient(135deg, #00dbde 0%, #fc00ff 100%)',
      leyenda: '¡Relámpago! Gana 5 puntos directos de servicio (Ace).' 
    },
    { 
      id: 'b4', nombre: 'Cazador de Bagels', icono: 'flame', nivelRequerido: 7, 
      imagenBanner: 'assets/banners/bagel-hunter.png', 
      leyenda: 'Especialista en "roscas". Entrega 3 Bagels (6-0) en torneos.' 
    },
    { 
      id: 'b5', nombre: 'Elite Player', icono: 'star', nivelRequerido: 10, 
      imagenBanner: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      leyenda: 'Consagrado. Solo para tenistas que dominan el top 10.' 
    },
    { 
      id: 'b6', nombre: 'Smasher Nocturno', icono: 'skull', nivelRequerido: 12, 
      imagenBanner: 'assets/banners/night-smash.jpg',
      leyenda: 'Terror de las canchas. Juega 10 partidos después de las 8:00 PM.' 
    },
    { 
      id: 'b7', nombre: 'Leyenda Bagel', icono: 'checkmark-circle', nivelRequerido: 20, 
      imagenBanner: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      leyenda: 'Inmortal. Máximo reconocimiento por trayectoria.' 
    }
  ];

  constructor() {
    addIcons({ cameraReverse, trophy, checkmarkCircle, saveOutline, star, lockClosed, flash, flame, skull });
  }

  ngOnInit() {}

  segmentChanged(event: any) {
    this.segmentoActual = event.detail.value;
  }

  /**
   * 🎨 Renderiza dinámicamente si el banner es imagen o color
   */
  getBannerStyle(valor: string | undefined) {
    const background = valor || this.bannerDefault;
    if (background.includes('linear-gradient') || background.startsWith('#')) {
      return { 'background': background };
    }
    return { 
      'background-image': `url(${background})`,
      'background-size': 'cover',
      'background-position': 'center'
    };
  }

  async cambiarFoto(uid: string) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image.dataUrl) {
        this.procesarSubidaFoto(uid, image.dataUrl);
      }
    } catch (e) {
      console.log('Selección de foto cancelada');
    }
  }

  async procesarSubidaFoto(uid: string, dataUrl: string) {
    const loader = await this.loadingCtrl.create({ 
      message: 'Actualizando foto...', 
      spinner: 'circles' 
    });
    await loader.present();

    try {
      const photoUrl = await this.rankingsService.uploadImage(uid, dataUrl);
      await this.rankingsService.updateUserData(uid, { foto: photoUrl });
      this.mostrarToast('¡Foto actualizada!', 'success');
    } catch (error) {
      this.mostrarToast('Error al subir imagen', 'danger');
    } finally {
      loader.dismiss();
    }
  }

  async seleccionarBanner(banner: any, user: PerfilTenista) {
    if ((user.nivel || 1) >= banner.nivelRequerido) {
      await this.rankingsService.updateUserData(user.uid, { 
        bannerSeleccionado: banner.imagenBanner 
      });
      this.mostrarToast(`Estandarte "${banner.nombre}" equipado`, 'success');
    } else {
      this.mostrarToast(`BLOQUEADO: ${banner.leyenda}`, 'warning');
    }
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2500, 
      color, 
      position: 'bottom',
      mode: 'ios'
    });
    await toast.present();
  }

  /**
   * 💾 Acción del botón de guardar
   */
  guardarCambios() {
    this.mostrarToast('Perfil sincronizado con la red AMT', 'primary');
  }
}
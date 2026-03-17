import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
  IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, 
  IonTextarea, IonSelect, IonSelectOption, IonInput,
  LoadingController, ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cameraReverse, star, trophy, saveOutline, cloudUploadOutline, 
  medalOutline, locationOutline 
} from 'ionicons/icons';

// Importamos el servicio unificado y el Header
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { RankingsService, PerfilTenista } from '../../core/services/rankings.service';
import { firstValueFrom, Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
    IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, 
    IonTextarea, IonSelect, IonSelectOption, IonInput
  ]
})
export class Tab3Page implements OnInit {
  private rankingsService = inject(RankingsService);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  segmentoActual: string = 'stats';
  usuario$: Observable<PerfilTenista | null> = this.rankingsService.usuarioActual$;
  
  // Objeto de edición
  editUser: Partial<PerfilTenista> = {
    nombre: '',
    descripcion: '',
    nivel: 1.0,
    ubicacion: '',
    sede: '',
    mano: '',
    estilo: ''
  };

  // Datos locales para la UI de estadísticas
  estadisticas = { partidosJugados: 24, victorias: 15 };
  torneosInscritos = [
    { nombre: 'Abierto de Tijuana', estado: 'En curso', puntos: 50 },
    { nombre: 'Copa AMT 2026', estado: 'Finalizado', puntos: 120 }
  ];

  constructor() {
    addIcons({ 
      cameraReverse, star, trophy, saveOutline, 
      cloudUploadOutline, medalOutline, locationOutline 
    });
  }

  async ngOnInit() {
    // Suscripción para llenar el formulario de edición con datos reales al cargar
    const user = await firstValueFrom(this.usuario$);
    if (user) {
      this.editUser = { ...user };
    }
  }

  /**
   * 📸 Abre la galería del dispositivo para cambiar la foto
   */
  async cambiarFoto() {
    const user = await firstValueFrom(this.usuario$);
    if (!user) return;

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true, // Permite recortar la foto
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos, // 👈 Forzamos la apertura de la Galería
      });

      if (image.dataUrl) {
        const loader = await this.loadingCtrl.create({ 
          message: 'Actualizando imagen de perfil...',
          spinner: 'circles'
        });
        await loader.present();
        
        try {
          // 1. Subimos a Firebase Storage
          const photoUrl = await this.rankingsService.uploadImage(user.uid, image.dataUrl);
          
          // 2. Actualizamos el documento en Firestore
          await this.rankingsService.updateUserData(user.uid, { foto: photoUrl });
          
          this.mostrarToast('¡Foto actualizada!', 'success');
        } catch (error) {
          console.error(error);
          this.mostrarToast('Error al subir la imagen', 'danger');
        } finally {
          loader.dismiss();
        }
      }
    } catch (e) {
      console.log('El usuario canceló la galería');
    }
  }

  /**
   * 💾 Guarda los cambios de texto/opciones en Firestore
   */
  async guardarCambios() {
    const user = await firstValueFrom(this.usuario$);
    if (!user) return;

    const loader = await this.loadingCtrl.create({ 
      message: 'Sincronizando con BagelsOnly...',
      spinner: 'circles'
    });
    await loader.present();

    try {
      // Guardamos en Firebase usando el objeto editUser vinculado al formulario
      await this.rankingsService.updateUserData(user.uid, {
        nombre: this.editUser.nombre,
        descripcion: this.editUser.descripcion,
        nivel: Number(this.editUser.nivel),
        sede: this.editUser.sede,
        mano: this.editUser.mano,
        ubicacion: this.editUser.ubicacion || 'Tijuana'
      });

      this.mostrarToast('¡Perfil sincronizado!', 'success');
      this.segmentoActual = 'stats'; // Cambiamos de pestaña al terminar
    } catch (error) {
      console.error(error);
      this.mostrarToast('Error al guardar los datos', 'danger');
    } finally {
      loader.dismiss();
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
}
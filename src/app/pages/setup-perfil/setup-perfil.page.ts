import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonItem, IonLabel, IonInput, IonButton, 
  IonSelect, IonSelectOption, IonTextarea, LoadingController, 
  ToastController, IonIcon, IonList 
} from '@ionic/angular/standalone';
import { RankingsService, PerfilTenista } from '../../core/services/rankings.service';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { tennisball, playForward } from 'ionicons/icons';

@Component({
  selector: 'app-setup-perfil',
  templateUrl: './setup-perfil.page.html',
  styleUrls: ['./setup-perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonItem, IonLabel, 
    IonInput, IonButton, IonSelect, IonSelectOption, 
    IonTextarea, IonIcon, IonList
  ]
})
export class SetupPerfilPage {
  private rankingsService = inject(RankingsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);
  private zone = inject(NgZone); // 🚀 Necesario para desbloquear la UI

  perfil: Partial<PerfilTenista> = {
    nombre: '',
    ubicacion: 'Tijuana',
    descripcion: '',
    xp: 0,
    nivel: 1,
    bagelsEntregados: 0,
    record: { ganados: 0, perdidos: 0 }
  };

  constructor() {
    addIcons({ tennisball, playForward });
  }

  async finalizarSetup() {
    if (!this.perfil.nombre) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, dinos tu nombre',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const loader = await this.loadingCtrl.create({ 
      message: 'Preparando la cancha...',
      spinner: 'circles'
    });
    await loader.present();

    try {
      const user = await this.authService.getCurrentUser();
      
      if (user) {
        // 1. Guardar en Firestore (con el contexto protegido en el servicio)
        await this.rankingsService.updateUserData(user.uid, this.perfil);
        
        // 2. Cerramos el loader ANTES de navegar
        await loader.dismiss();

        // 3. Forzamos la navegación de vuelta a la zona de Angular
        this.zone.run(() => {
          this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        });

      } else {
        await loader.dismiss();
      }
    } catch (error) {
      console.error('Error al finalizar setup:', error);
      if (loader) await loader.dismiss();
      
      const errToast = await this.toastCtrl.create({
        message: 'Error al conectar con la red de BagelsOnly',
        duration: 2000,
        color: 'danger'
      });
      await errToast.present();
    }
  }
}
import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonItem, IonLabel, IonInput, IonButton, 
  IonSelect, IonSelectOption, IonTextarea, LoadingController, 
  ToastController, IonIcon, IonList 
} from '@ionic/angular/standalone';
import { RankingsService } from '../../core/services/rankings.service';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { playForward } from 'ionicons/icons';

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
  private zone = inject(NgZone);

  perfil = {
    infoBasica: {
      nombre: '',
      genero: '', // <-- Agregado
      bio: '',
      nivel: '1.0',
      ubicacion: '',
      manoDominante: 'Derecho'
    }
  };

  constructor() {
    addIcons({ playForward });
  }

  async finalizarSetup() {
    if (!this.perfil.infoBasica.nombre || this.perfil.infoBasica.nombre.length < 3) {
      this.mostrarToast('Por favor, ingresa tu nombre', 'warning');
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
        const updates = {
          'infoBasica.nombre': this.perfil.infoBasica.nombre.trim(),
          'infoBasica.nombreLower': this.perfil.infoBasica.nombre.trim().toLowerCase(),
          'infoBasica.genero': this.perfil.infoBasica.genero, // <-- Agregado
          'infoBasica.ubicacion': this.perfil.infoBasica.ubicacion,
          'infoBasica.bio': this.perfil.infoBasica.bio,
          'infoBasica.nivel': this.perfil.infoBasica.nivel,
          'infoBasica.manoDominante': this.perfil.infoBasica.manoDominante,
          'infoBasica.lastActive': new Date()
        };

        await this.rankingsService.updateUserData(user.uid, updates as any);
        
        await loader.dismiss();
        this.zone.run(() => {
          this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        });

      } else {
        await loader.dismiss();
        this.mostrarToast('Sesión no encontrada', 'danger');
      }
    } catch (error) {
      console.error(error);
      await loader.dismiss();
      this.mostrarToast('Error al guardar perfil', 'danger');
    }
  }

  async mostrarToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: color });
    await t.present();
  }
}
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon,
  LoadingController, ToastController 
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, cloudUploadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonItem, IonLabel, IonInput, IonButton, IonList, IonIcon
  ]
})
export class LoginPage {
  correo = '';
  clave = '';
  verClave = false; // Control de visibilidad
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, cloudUploadOutline });
  }

  toggleVerClave() {
    this.verClave = !this.verClave;
  }

  async entrar() {
    if (!this.correo || !this.clave) {
      this.mostrarToast('Por favor, rellena todos los campos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Autenticando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.authService.login(this.correo, this.clave);
      await SplashScreen.show({ showDuration: 1500, autoHide: true });
      await this.router.navigate(['/tabs/tab3']);
    } catch (e: any) {
      this.clave = '';
      let mensaje = 'Credenciales incorrectas';
      if (e.code === 'auth/user-not-found') mensaje = 'El usuario no existe';
      if (e.code === 'auth/wrong-password') mensaje = 'Contraseña incorrecta';
      this.mostrarToast(mensaje, 'danger');
    } finally {
      loading.dismiss();
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
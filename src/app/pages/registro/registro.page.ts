import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { 
  ToastController, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonIcon, 
  IonText, 
  LoadingController 
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { addIcons } from 'ionicons'; 
import { eyeOutline, eyeOffOutline, personOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

// --- NUEVAS IMPORTACIONES PARA PUSH ---
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonButton, 
    IonIcon, 
    IonText
  ]
})
export class RegistroPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private zone = inject(NgZone);
  private loadingCtrl = inject(LoadingController);

  nuevoUsuario = { nombre: '', email: '', password: '' };
  verClave = false;

  constructor() {
    addIcons({ 
      eyeOutline, 
      eyeOffOutline, 
      personOutline, 
      mailOutline, 
      lockClosedOutline 
    });
  }

  toggleVerClave() {
    this.verClave = !this.verClave;
  }

  // --- FUNCIÓN PRIVADA PARA CAPTURAR EL TOKEN ---
  private async obtenerPushToken(): Promise<string> {
    try {
      const info = await Device.getInfo();
      // Si es navegador web, las notificaciones nativas no funcionan, retornamos vacío
      if (info.platform === 'web') return '';

      const perm = await PushNotifications.requestPermissions();
      if (perm.receive === 'granted') {
        await PushNotifications.register();
        
        return new Promise((resolve) => {
          PushNotifications.addListener('registration', (token: any) => {
  resolve(token.value);
});
          // Timeout de 3 segundos para no bloquear el registro si falla la red de FCM
          setTimeout(() => resolve(''), 3000);
        });
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  async registrar() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || this.nuevoUsuario.password.length < 6) {
      this.mostrarToast('Datos incompletos o contraseña muy corta (mín. 6)', 'warning');
      return;
    }

    const loader = await this.loadingCtrl.create({ 
      message: 'Creando cuenta...',
      spinner: 'crescent' 
    });
    await loader.present();

    try {
      // 1. Intentamos obtener el token antes de llamar al AuthService
      const tokenFCM = await this.obtenerPushToken();

      // 2. Enviamos el token al servicio (recuerda que tu AuthService debe aceptar 4 parámetros ahora)
      const res = await this.authService.registro(
        this.nuevoUsuario.email.trim(),
        this.nuevoUsuario.password,
        this.nuevoUsuario.nombre.trim(),
        tokenFCM 
      );

      if (res) {
        await this.mostrarToast('¡Cuenta creada! Vamos a configurar tu perfil.', 'success');
        
        this.zone.run(() => {
          this.router.navigate(['/setup-perfil'], { replaceUrl: true });
        });
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      let mensajeError = 'Hubo un error al crear la cuenta.';
      if (error.code === 'auth/email-already-in-use') mensajeError = 'Este correo ya está en uso.';
      if (error.code === 'auth/invalid-email') mensajeError = 'El formato del correo no es válido.';
      
      this.mostrarToast(mensajeError, 'danger');
    } finally {
      loader.dismiss();
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
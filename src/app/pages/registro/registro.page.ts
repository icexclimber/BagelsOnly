import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastController, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText, LoadingController } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText]
})
export class RegistroPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private zone = inject(NgZone);
  private loadingCtrl = inject(LoadingController);

  nuevoUsuario = { nombre: '', email: '', password: '' };

  async registrar() {
    if (!this.nuevoUsuario.email || this.nuevoUsuario.password.length < 6 || !this.nuevoUsuario.nombre) {
      this.mostrarToast('Datos incompletos o contraseña muy corta (mín. 6)', 'warning');
      return;
    }

    const loader = await this.loadingCtrl.create({ message: 'Creando cuenta...' });
    await loader.present();

    try {
      const res = await this.authService.registro(
        this.nuevoUsuario.email.trim(),
        this.nuevoUsuario.password,
        this.nuevoUsuario.nombre.trim()
      );

      if (res) {
        await this.mostrarToast('¡Cuenta creada! Vamos a configurar tu perfil.', 'success');
        
        this.zone.run(() => {
          // 🚀 Redirección al Onboarding
          this.router.navigate(['/setup-perfil'], { replaceUrl: true });
        });
      }
    } catch (error: any) {
      let mensajeError = 'Hubo un error al crear la cuenta.';
      if (error.code === 'auth/email-already-in-use') mensajeError = 'Este correo ya está en uso.';
      this.mostrarToast(mensajeError, 'danger');
    } finally {
      loader.dismiss();
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}
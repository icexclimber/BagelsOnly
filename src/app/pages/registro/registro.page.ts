import { Component, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText 
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

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

  nuevoUsuario = { nombre: '', email: '', password: '' };

  async registrar() {
    // 1. Validación inicial
    if (!this.nuevoUsuario.email || this.nuevoUsuario.password.length < 6 || !this.nuevoUsuario.nombre) {
      this.mostrarToast('Datos incompletos o contraseña muy corta (mín. 6)', 'warning');
      return;
    }

    try {
      const res = await this.authService.registro(
        this.nuevoUsuario.email.trim(),
        this.nuevoUsuario.password,
        this.nuevoUsuario.nombre.trim()
      );

      if (res) {
        // Mostramos el mensaje de éxito
        await this.mostrarToast('¡Bienvenido a BagelsOnly! Cuenta creada.', 'success');
        
        // 2. NAVEGACIÓN FORZADA EN ZONA
        // Esto soluciona el problema de que no te permite navegar al perfil
        this.zone.run(() => {
          this.router.navigate(['/tabs/tab1'], { 
            queryParams: { nuevoUsuario: true },
            replaceUrl: true 
          });
        });
      }
    } catch (error: any) {
      console.error('Error capturado:', error);
      
      let mensajeError = 'Hubo un error al crear la cuenta.';
      if (error.code === 'auth/email-already-in-use') {
        mensajeError = 'Este correo ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        mensajeError = 'El formato del correo no es válido.';
      }

      this.mostrarToast(mensajeError, 'danger');
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
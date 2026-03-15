import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText 
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

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

  nuevoUsuario = { nombre: '', email: '', password: '' };

  async registrar() {
    // Validación básica para evitar el Error 400 de Firebase
    if (!this.nuevoUsuario.email || this.nuevoUsuario.password.length < 6 || !this.nuevoUsuario.nombre) {
      this.mostrarToast('Datos incompletos o contraseña muy corta (mín. 6)', 'warning');
      return;
    }

    try {
      const res = await this.authService.registro(
        this.nuevoUsuario.email,
        this.nuevoUsuario.password,
        this.nuevoUsuario.nombre
      );

      if (res) {
        await this.mostrarToast('¡Bienvenido a BagelsOnly! Cuenta creada.', 'success');
        this.router.navigateByUrl('/login');
      }
    } catch (error: any) {
      console.error('Error capturado:', error);
      
      let mensajeError = 'Hubo un error al crear la cuenta.';
      if (error.code === 'auth/email-already-in-use') {
        mensajeError = 'Este correo ya está en uso.';
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
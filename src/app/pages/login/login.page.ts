import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// Importa CADA componente que uses en el HTML
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, IonList 
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonItem, IonLabel, IonInput, IonButton, IonList // <--- Agrégalos aquí
  ]
})
export class LoginPage {
  correo = '';
  clave = '';
  private authService = inject(AuthService);

 async entrar() {
  console.log('Intentando entrar con:', this.correo); // <--- Añade esto para probar
  try {
    await this.authService.login(this.correo, this.clave);
    console.log('¡Login exitoso!');
  } catch (e: any) {
    console.error('Error de login:', e);
    alert('Error: ' + e.message); // Esto te dirá exactamente qué falló
  }
}
}
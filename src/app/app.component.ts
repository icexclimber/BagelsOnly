import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { 
  IonApp, IonRouterOutlet, IonMenu, IonContent, IonList, 
  IonListHeader, IonLabel, IonItem, IonIcon, IonMenuToggle,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  medalOutline, trophyOutline, eyeOutline, mailOutline, 
  logoYoutube, logoInstagram, documentTextOutline, 
  shieldCheckmarkOutline, logOutOutline 
} from 'ionicons/icons';

// Importamos el servicio
import { UserService } from './core/services/user.service'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonApp, 
    IonRouterOutlet, 
    IonMenu, 
    IonContent, 
    IonList, 
    IonListHeader, 
    IonLabel, 
    IonItem, 
    IonIcon, 
    IonMenuToggle,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton
  ],
})
export class AppComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  
  // Referencias a los modales
  @ViewChild('modalTerminos') modalTerminos!: IonModal;
  @ViewChild('modalPrivacidad') modalPrivacidad!: IonModal;

  usuario$ = this.userService.user$;

  constructor() {
    addIcons({ 
      medalOutline, 
      trophyOutline, 
      eyeOutline, 
      mailOutline, 
      logoYoutube, 
      logoInstagram, 
      documentTextOutline, 
      shieldCheckmarkOutline, 
      logOutOutline 
    });
  }

  // --- NAVEGACIÓN ---
  irAPerfil() {
    this.router.navigate(['/tabs/tab1']);
  }

  organizarTorneo() {
    this.router.navigate(['/crear-partido']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
  
  // --- MODALES ---
  abrirModal(tipo: string) {
    if (tipo === 'terminos') this.modalTerminos.present();
    if (tipo === 'privacidad') this.modalPrivacidad.present();
  }

  cerrarModal(tipo: string) {
    if (tipo === 'terminos') this.modalTerminos.dismiss();
    if (tipo === 'privacidad') this.modalPrivacidad.dismiss();
  }

  // --- CONTACTO Y ENLACES ---
  
  // Hemos movido la lógica de correo dentro de la clase
  contacto(email: string) {
    const asunto = encodeURIComponent('Consulta desde App AMT - Bagels Only');
    const cuerpo = encodeURIComponent('Hola, me gustaría obtener más información sobre...');
    
    // Construimos el enlace mailto
    const mailtoUrl = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
    
    // Abrimos el cliente de correo
    window.location.href = mailtoUrl;
    
    console.log('Abriendo cliente de correo para:', email);
  }

  abrirEnlace(url: string) {
    if (url) {
      window.open(url, '_blank');
      console.log('Navegando a enlace externo:', url);
    }
  }

  verTorneosSeguidos() { console.log('Torneos seguidos'); }
}
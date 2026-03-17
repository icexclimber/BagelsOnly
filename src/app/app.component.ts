import { Component, inject, ViewChild, OnInit } from '@angular/core';
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
  shieldCheckmarkOutline, logOutOutline, locationOutline 
} from 'ionicons/icons';

// Importamos el servicio actualizado con logs de depuración
import { RankingsService } from './core/services/rankings.service'; 

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
export class AppComponent implements OnInit {
  private rankingsService = inject(RankingsService);
  private router = inject(Router);
  
  // Referencias a los modales (asegúrate de que los IDs coincidan en el HTML)
  @ViewChild('modalTerminos') modalTerminos!: IonModal;
  @ViewChild('modalPrivacidad') modalPrivacidad!: IonModal;

  // Observable que alimenta el menú lateral
  usuario$ = this.rankingsService.usuarioActual$;

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
      logOutOutline,
      locationOutline 
    });
  }

  ngOnInit() {
    // Monitoreo preventivo: Si esto no imprime nada en consola, 
    // el problema está en la conexión de Firebase o el Auth.
    this.usuario$.subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ Menú Lateral: Datos de usuario cargados', user.nombre);
        } else {
          console.warn('⚠️ Menú Lateral: No se encontró perfil de usuario.');
        }
      },
      error: (err) => console.error('❌ Error en el stream de usuario:', err)
    });
  }

  // --- NAVEGACIÓN ---
  
  irAPerfil() {
    // Redirige a Tab3 donde está la edición de perfil
    this.router.navigate(['/tabs/tab3']);
  }

  organizarTorneo() {
    this.router.navigate(['/crear-partido']);
  }

  logout() {
    // Puedes llamar a un método de logout en tu servicio de auth aquí
    this.router.navigate(['/login']);
  }
  
  // --- CONTROL DE MODALES ---
  abrirModal(tipo: string) {
    if (tipo === 'terminos') this.modalTerminos.present();
    if (tipo === 'privacidad') this.modalPrivacidad.present();
  }

  cerrarModal(tipo: string) {
    if (tipo === 'terminos') this.modalTerminos.dismiss();
    if (tipo === 'privacidad') this.modalPrivacidad.dismiss();
  }

  // --- CONTACTO Y REDES SOCIALES ---
  
  contacto(email: string) {
    const asunto = encodeURIComponent('Consulta desde App Bagels Only');
    const cuerpo = encodeURIComponent('Hola, me gustaría obtener más información sobre la liga...');
    const mailtoUrl = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
    
    window.location.href = mailtoUrl;
  }

  abrirEnlace(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  verTorneosSeguidos() { 
    console.log('Navegando a torneos seguidos...'); 
  }
}
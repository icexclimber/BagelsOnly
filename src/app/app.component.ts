import { Component, OnInit, inject, OnDestroy } from '@angular/core'; 
import { Router, NavigationEnd } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { 
  IonApp, IonRouterOutlet, IonMenu, IonContent, IonList, 
  IonListHeader, IonLabel, IonItem, IonIcon, IonMenuToggle,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  ToastController, MenuController 
} from '@ionic/angular/standalone';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker'; // <-- Import para PWA
import { addIcons } from 'ionicons';
import { 
  medalOutline, trophyOutline, eyeOutline, mailOutline, 
  logoYoutube, logoInstagram, documentTextOutline, 
  shieldCheckmarkOutline, logOutOutline, locationOutline,
  personCircleOutline, addCircleOutline, fitnessOutline,
  giftOutline, notificationsOutline, helpBuoyOutline,
  refreshOutline, tennisballOutline // <-- Iconos adicionales para PWA
} from 'ionicons/icons';

import { RankingsService } from './core/services/rankings.service'; 
import { Observable, filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonApp, IonRouterOutlet, IonMenu, IonContent, IonList, 
    IonListHeader, IonLabel, IonItem, IonIcon, IonMenuToggle,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  private rankingsService = inject(RankingsService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  private swUpdate = inject(SwUpdate); // <-- Inyectar Service Worker
  private toastCtrl = inject(ToastController); // <-- Inyectar Toasts
  
  private lastActiveTime: number = Date.now();
  private readonly TIMEOUT_RESHOW = 1000 * 60 * 5; 
  private updateSub?: Subscription;
  
  isModalTerminosOpen = false;
  isModalPrivacidadOpen = false;
  usuario$: Observable<any> = this.rankingsService.usuarioActual$;

  constructor() {
    addIcons({ 
      medalOutline, trophyOutline, eyeOutline, mailOutline, 
      logoYoutube, logoInstagram, documentTextOutline, 
      shieldCheckmarkOutline, logOutOutline, locationOutline,
      personCircleOutline, addCircleOutline, fitnessOutline,
      giftOutline, notificationsOutline, helpBuoyOutline,
      refreshOutline, tennisballOutline
    });
  }

  ngOnInit() {
    // 1. Lógica de PWA: Detectar nueva versión
    this.verificarActualizacionesPWA();

    // 2. Lógica de Navegación y Splash
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url.includes('/login')) {
        this.mostrarSplashTemporal(1200);
      }
    });

    // 3. Lógica de Re-activación de Splash por tiempo
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - this.lastActiveTime > this.TIMEOUT_RESHOW) {
          this.mostrarSplashTemporal(2000);
        }
      } else {
        this.lastActiveTime = Date.now();
      }
    });

    this.usuario$.subscribe({
      next: (user: any) => { 
        if (user) console.log('✅ Menú Lateral: Datos cargados', user.infoBasica?.nombre);
      },
      error: (err: any) => console.error('❌ Error en el stream:', err)
    });
  }

  // --- NUEVA LÓGICA DE ACTUALIZACIÓN PWA ---
  async verificarActualizacionesPWA() {
    if (!this.swUpdate.isEnabled) return;

    this.updateSub = this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(async () => {
        const toast = await this.toastCtrl.create({
          message: '🚀 ¡Nueva versión de BagelsOnly disponible!',
          position: 'bottom',
          mode: 'ios',
          color: 'primary',
          buttons: [
            {
              side: 'end',
              icon: 'refresh-outline',
              text: 'ACTUALIZAR',
              handler: () => { window.location.reload(); }
            }
          ]
        });
        await toast.present();
      });
  }

  mostrarSplashTemporal(ms: number) {
  const splash = document.getElementById('custom-splash');
  const msgElement = document.getElementById('splash-msg');
  if (!splash) return;

  // Lista de mensajes para tu tesis
  const mensajes = [
    "Afilando raquetas...",
    "Limpiando las líneas...",
    "Calentando el servicio...",
    "Sincronizando rankings...",
    "Canchas listas en Tijuana..."
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (msgElement) msgElement.innerText = mensajes[i % mensajes.length];
    i++;
  }, 600); // Cambia el mensaje cada 600ms

  splash.classList.add('show');

  setTimeout(() => {
    clearInterval(interval); // Detenemos los mensajes
    splash.style.opacity = '0';
    setTimeout(() => { splash.classList.remove('show'); }, 600);
  }, ms);
}

  // --- NAVEGACIÓN ---
  irARecompensas() { this.menuCtrl.close(); this.router.navigate(['/recompensas']); }
  irANotificaciones() { this.menuCtrl.close(); this.router.navigate(['/notificaciones']); }
  irAAyudaSoporte() { this.menuCtrl.close(); this.router.navigate(['/ayuda-soporte']); }
  
  irAPerfil() {
    this.menuCtrl.close();
    this.mostrarSplashTemporal(800);
    setTimeout(() => { this.router.navigate(['/tabs/tab5']); }, 250);
  }

  irAOrganizar() { this.menuCtrl.close(); this.router.navigate(['/mis-torneos']); }

  logout() {
    this.menuCtrl.close();
    this.mostrarSplashTemporal(1200); 
    setTimeout(() => { this.router.navigate(['/login']); }, 300);
  }
  
  abrirModal(tipo: string) {
    if (tipo === 'terminos') this.isModalTerminosOpen = true;
    if (tipo === 'privacidad') this.isModalPrivacidadOpen = true;
  }

  contacto(email: string) {
    const asunto = encodeURIComponent('Consulta desde App Bagels Only');
    const cuerpo = encodeURIComponent('Hola, me gustaría obtener más información...');
    window.location.href = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
  }

  abrirEnlace(url: string) { if (url) window.open(url, '_blank'); }
  verTorneosSeguidos() { this.menuCtrl.close(); this.router.navigate(['/torneos-seguidos']); }

  ngOnDestroy() {
    if (this.updateSub) this.updateSub.unsubscribe();
  }
}
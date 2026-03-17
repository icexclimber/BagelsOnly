import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [IonContent, IonSpinner]
})
export class SplashPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.iniciarApp();
  }

  async iniciarApp() {
    // 1. Esperamos 2.5 segundos para que luzca el logo
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const user = await this.authService.getCurrentUser();
      
      if (user) {
        // Si hay usuario, vamos al Dashboard (Tab1)
        this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
      } else {
        // Si no hay sesión, al Login
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    } catch (error) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
}
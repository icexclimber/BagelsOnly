import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
  IonCardContent, IonBadge, IonProgressBar, IonItem, IonLabel, IonList, IonIcon, IonButton } from '@ionic/angular/standalone';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { Observable, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonButton, 
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, 
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, 
    IonCardContent, IonBadge, IonProgressBar, IonItem, IonLabel, IonList, IonIcon
  ],
})
export class Tab1Page implements OnInit {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);


salir() {
  this.authService.logout();
}

  perfil$: Observable<any> = of(null);

  ngOnInit() {
    // Escuchamos al usuario logueado y buscamos su perfil en Firestore
    this.perfil$ = this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          const userRef = doc(this.firestore, `perfiles/${user.uid}`);
          return docData(userRef);
        } else {
          return of(null);
        }
      })
    );
  }
}
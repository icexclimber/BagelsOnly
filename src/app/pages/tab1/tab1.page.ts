import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
  IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, 
  IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonCard, IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraReverse, star, trophy, saveOutline, searchOutline } from 'ionicons/icons';

// Componentes y Servicios
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
    IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, 
    IonTextarea, IonSelect, IonSelectOption, IonProgressBar, IonCard, IonCardContent
  ]
})
export class Tab1Page implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  
  segmentoActual: string = 'stats';
  usuario$ = this.userService.user$; 

  editUser = {
    descripcion: '',
    nivel: ''
  };

  torneosInscritos = [
    { nombre: 'Abierto de Tijuana', estado: 'En curso', puntos: 50 },
    { nombre: 'Copa AMT 2026', estado: 'Finalizado', puntos: 120 }
  ];

  constructor() {
    addIcons({ cameraReverse, star, trophy, saveOutline, searchOutline });
  }

  ngOnInit() {
    this.usuario$.subscribe((user: any) => {
      if (user) {
        this.editUser.descripcion = user.descripcion || '';
        this.editUser.nivel = user.nivel || '4.5';
      }
    });
  }

  // MÉTODO CORREGIDO: Lógica de cambio de segmento
  segmentChanged(event: any) {
    const nuevoValor = event.detail.value;
    
    // Pequeño delay para asegurar que el DOM responda (soluciona errores de offsetHeight)
    setTimeout(() => {
      this.segmentoActual = nuevoValor;
      this.cdr.detectChanges(); 
      console.log('Segmento activo:', this.segmentoActual);
    }, 50);
  }

  retarOponente() {
    console.log('Buscando oponente en Tijuana...');
    alert('Buscando tenistas de nivel ' + this.editUser.nivel + ' cerca de ti...');
  }

  cambiarFoto() {
    console.log('Iniciando cambio de foto de perfil...');
  }

  guardarCambios() {
    this.userService.updateUsuario(this.editUser);
    console.log('Cambios guardados exitosamente');
    alert('Perfil actualizado correctamente');
  }

  logout() {
    console.log('Cerrando sesión del tenista...');
  }
}
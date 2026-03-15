import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
  IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, 
  IonTextarea, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraReverse, star, trophy, saveOutline } from 'ionicons/icons';

// Importamos tu Header Global y el Servicio
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, // <--- Esto quita los errores de ngModel
    HeaderGlobalComponent, // <--- Esto quita el error de app-header-global
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, 
    IonGrid, IonRow, IonCol, IonList, IonItem, IonBadge, 
    IonTextarea, IonSelect, IonSelectOption
  ]
})
export class Tab3Page implements OnInit {
  private userService = inject(UserService);
  
  segmentoActual: string = 'stats';
  usuario$ = this.userService.user$;
  
  // Datos para el dashboard
  estadisticas = {
    partidosJugados: 24,
    victorias: 15,
    rankingNacional: 12
  };

  torneosInscritos = [
    { nombre: 'Abierto de Tijuana', estado: 'En curso', puntos: 50 },
    { nombre: 'Copa AMT 2026', estado: 'Finalizado', puntos: 120 }
  ];

  editUser = {
    descripcion: '',
    nivel: ''
  };

  constructor() {
    // Registramos los iconos que usamos en esta página
    addIcons({ cameraReverse, star, trophy, saveOutline });
  }

  ngOnInit() {
    // Cargamos los datos actuales en el formulario de edición
    this.usuario$.subscribe((user: any) => {
      if (user) {
        this.editUser.descripcion = user.descripcion || '';
        this.editUser.nivel = user.nivel || '4.5';
      }
    });
  }

  cambiarFoto() {
    console.log('Cambiando foto...');
  }

  guardarCambios() {
    this.userService.updateUsuario(this.editUser);
    console.log('Datos actualizados en el servicio');
  }
}
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonList, IonItem, IonLabel, IonAvatar, IonIcon,
  IonModal, IonProgressBar, IonButtons, IonButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  caretUp, remove, locationOutline, calendarNumberOutline, 
  peopleOutline, ribbonOutline, cashOutline, arrowForwardOutline, personCircleOutline, closeCircle 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBadge, IonList, IonItem, IonLabel, IonAvatar, IonIcon,
    IonModal, IonProgressBar, IonButtons, IonButton, HeaderGlobalComponent
  ]
})
export class HomePage implements OnInit {
  private router = inject(Router);
  
  @ViewChild('modalEvento') modalEvento!: any;

  eventoSeleccionado: any = null;

  // Lista actualizada con los 5 torneos solicitados
  torneos = [
    { 
      id: 1,
      nombre: 'Torneo Chuy de La Paz', 
      fecha: '05 Abr', 
      club: 'La Paz Tennis Center', 
      categoria: 'A/B/C', 
      costo: 500,
      imagen: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?q=80&w=500' 
    },
    { 
      id: 2,
      nombre: 'BoL 4.0', 
      fecha: '22 Jul', 
      club: 'BagelsOnly HQ', 
      categoria: 'Elite', 
      costo: 350,
      imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500' 
    },
    { 
      id: 3,
      nombre: 'Torneo Club Campestre', 
      fecha: '15 May', 
      club: 'Campestre Tijuana', 
      categoria: 'Singles/Doubles', 
      costo: 600,
      imagen: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=500' 
    },
    { 
      id: 4,
      nombre: 'Team Tennis RECHARGED 2026', 
      fecha: '10 Jun', 
      club: 'Varias Sedes', 
      categoria: 'Equipos', 
      costo: 1200,
      imagen: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?q=80&w=500' 
    },
  ];

  escalerasActivas = [
    { 
      id: 101,
      nombre: 'BagelsOnly OpenLadder(3.5-4.5) ', 
      zona: 'Tijuana', 
      nivel: 'C/B', 
      jugadores: 100,
      costo: 0,
      club: 'Cualquier Cancha',
      imagen: 'https://images.unsplash.com/photo-1595435064212-01004a8ad8d7?q=80&w=500' 
    },
    { 
      id: 102,
      nombre: 'Bagels Only OpenLadder(2.5-3.5)', 
      zona: 'Tijuana', 
      nivel: 'B/C', 
      jugadores: 100,
      costo: 0,
      club: 'Cualquier Cancha',
      imagen: 'https://images.unsplash.com/photo-1595435064212-01004a8ad8d7?q=80&w=500' 
    },
    { 
      id: 103,
      nombre: 'Club Bancario Tijuana', 
      zona: 'Tijuana', 
      nivel: 'D/C/B', 
      jugadores: 44,
      costo: 400,
      club: 'Club Bancario/Unidad Deportiva/Cumbres',
      imagen: 'https://images.unsplash.com/photo-1595435064212-01004a8ad8d7?q=80&w=500' 
    },
  ];

  constructor() {
    addIcons({
      personCircleOutline, locationOutline, calendarNumberOutline, 
      peopleOutline, ribbonOutline, cashOutline, arrowForwardOutline, 
      caretUp, remove, closeCircle
    });
  }

  ngOnInit() {}

  abrirDetalles(evento: any) {
    // 1. Limpiamos primero para forzar el refresco del modal
    this.eventoSeleccionado = null;
    
    setTimeout(() => {
      this.eventoSeleccionado = evento;
      console.log('Abriendo:', evento.nombre);
      
      // 2. Abrimos el modal
      if (this.modalEvento) {
        this.modalEvento.present();
      }
    }, 50); // Un delay corto de 50ms es suficiente para resetear el DOM
  }

  irAPagar(evento: any) {
    if (this.modalEvento) {
      this.modalEvento.dismiss();
    }
    console.log('Iniciando pago:', evento.nombre);
    // Aquí podrías navegar: this.router.navigate(['/checkout', evento.id]);
  }
}
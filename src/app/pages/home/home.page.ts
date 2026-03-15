import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonList, IonItem, IonLabel, IonAvatar, IonIcon,
  IonModal, IonProgressBar, IonButtons, IonButton 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  caretUp, remove, locationOutline, calendarNumberOutline, 
  peopleOutline, ribbonOutline, cashOutline, arrowForwardOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar, 
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonBadge, IonList, IonItem, IonLabel, IonAvatar, IonIcon,
    IonModal, IonProgressBar, IonButtons, IonButton
  ]
})
export class HomePage implements OnInit {
  private router = inject(Router);
  
  // Referencia al modal para poder cerrarlo desde el código
  @ViewChild('modalEvento') modalEvento!: any;

  // Variable que guarda el torneo que el usuario seleccionó
  eventoSeleccionado: any = null;

  torneos = [
    { 
      id: 1,
      nombre: 'Open Tijuana 2026', 
      fecha: '20 Mar', 
      club: 'Club Britania', 
      categoria: 'Abierta', 
      inscritos: 24,
      totalCupo: 32,
      costo: 450,
      fechaLimite: '15 de Marzo',
      imagen: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=500' 
    }
  ];

  escalerasActivas = [
    { 
      id: 101,
      nombre: 'Escalera Amateur', 
      zona: 'Tijuana', 
      nivel: 'B/C', 
      jugadores: 15,
      totalCupo: 40,
      inscritos: 15, // Reutilizamos para el modal
      costo: 200,
      club: 'Canchas Municipales',
      imagen: 'https://images.unsplash.com/photo-1595435064212-01004a8ad8d7?q=80&w=500' 
    }
  ];

  constructor() {
    addIcons({personCircleOutline,locationOutline,calendarNumberOutline,peopleOutline,ribbonOutline,cashOutline,arrowForwardOutline,caretUp,remove});
  }

  ngOnInit() {}



abrirDetalles(evento: any) {
    console.log('Abriendo:', evento.nombre);
    this.eventoSeleccionado = evento;
    // Delay para asegurar que el contenido del modal se renderice
    setTimeout(() => {
      if (this.modalEvento) {
        this.modalEvento.present();
      }
    }, 100);
  }

  irAPagar(evento: any) {
    this.modalEvento.dismiss();
    console.log('Iniciando pago:', evento.nombre);
  }

}
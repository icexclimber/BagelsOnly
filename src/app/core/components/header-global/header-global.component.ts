import { Component, Input, inject, OnInit, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonIcon, IonMenuButton, IonBadge, ModalController,
  IonPopover, IonList, IonItem, IonAvatar, IonLabel, IonListHeader, IonContent,
  ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personAddOutline, notificationsOutline, searchOutline, 
  checkmarkCircle, closeCircle, flame, peopleOutline, alertCircleOutline 
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service'; 
import { 
  Firestore, collection, addDoc, serverTimestamp, query, 
  where, collectionData, doc, updateDoc, deleteDoc, orderBy,
  getDocs, getDoc 
} from '@angular/fire/firestore';
import { BuscarJugadoresModalHeader } from 'src/app/pages/torneo-detalle/modals/buscar-jugadores.modal.header';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-header-global',
  templateUrl: './header-global.component.html',
  styleUrls: ['./header-global.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonIcon, IonMenuButton, IonBadge, 
    IonPopover, IonList, IonItem, IonAvatar, IonLabel, IonListHeader, IonContent
  ]
})
export class HeaderGlobalComponent implements OnInit {
  @Input() titulo: string = 'BagelsOnly';

  private injector = inject(EnvironmentInjector);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private toastCtrl = inject(ToastController);

  notificaciones$: Observable<any[]>;

  constructor() {
    addIcons({ 
      personAddOutline, notificationsOutline, searchOutline, 
      checkmarkCircle, closeCircle, flame, peopleOutline, alertCircleOutline
    });

    this.notificaciones$ = this.authService.user$.pipe(
      switchMap((user: any) => {
        if (user?.uid) {
          return runInInjectionContext(this.injector, () => {
            const notifRef = collection(this.firestore, `usuarios/${user.uid}/notificaciones`);
            const q = query(
              notifRef, 
              where('status', '==', 'pendiente'),
              orderBy('fecha', 'desc')
            );

            return collectionData(q, { idField: 'id' }).pipe(
              tap(data => console.log('🔔 Centro de Notificaciones actualizado:', data))
            );
          });
        } else {
          return of([]);
        }
      })
    );
  }

  ngOnInit() {}

  navegarAlPerfil(userId: string) {
    if (userId) {
      this.router.navigate(['/perfil-amigo', userId]);
    }
  }

  async abrirModalBusqueda() {
    const modal = await this.modalCtrl.create({
      component: BuscarJugadoresModalHeader,
      initialBreakpoint: 0.85,
      breakpoints: [0, 0.5, 0.85, 1],
      cssClass: 'modal-jugadores-custom'
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (data && data.usuario) {
      if (data.accion === 'agregar') {
        this.enviarSolicitudAmistad(data.usuario);
      }
      
      if (data.accion === 'ver') {
        this.navegarAlPerfil(data.usuario.id);
      }
    }
  }

  async enviarSolicitudAmistad(usuarioReceptor: any) {
    const miUid = this.authService.currentUserId;
    if (!miUid || !usuarioReceptor?.id) return;

    try {
      const miPerfilRef = doc(this.firestore, `perfiles/${miUid}`);
      const miPerfilSnap = await getDoc(miPerfilRef);
      const miData = miPerfilSnap.data();

      const miNombreReal = miData?.['infoBasica']?.nombre || miData?.['nombre'] || 'Tenista';
      const miFotoReal = miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';

      const notifRef = collection(this.firestore, `usuarios/${usuarioReceptor.id}/notificaciones`);

      await addDoc(notifRef, {
        de: miUid,
        para: usuarioReceptor.id,
        nombreEmisor: miNombreReal,
        fotoEmisor: miFotoReal,
        status: 'pendiente',
        fecha: serverTimestamp(),
        tipo: 'amistad',
        mensaje: 'Quiere ser tu amigo'
      });
    } catch (error) {
      console.error("❌ Error al enviar solicitud:", error);
    }
  }

  async enviarInvitacionDobles(usuarioReceptor: any) {
    const miUid = this.authService.currentUserId;
    if (!miUid || !usuarioReceptor?.id) return;

    try {
      const miPerfilRef = doc(this.firestore, `perfiles/${miUid}`);
      const miPerfilSnap = await getDoc(miPerfilRef);
      const miData = miPerfilSnap.data();

      const miNombreReal = miData?.['infoBasica']?.nombre || miData?.['nombre'] || 'Tenista';
      const miFotoReal = miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';

      const notifRef = collection(this.firestore, `usuarios/${usuarioReceptor.id}/notificaciones`);

      await addDoc(notifRef, {
        de: miUid,
        para: usuarioReceptor.id,
        nombreEmisor: miNombreReal,
        fotoEmisor: miFotoReal,
        status: 'pendiente',
        fecha: serverTimestamp(),
        tipo: 'dobles',
        mensaje: '¡Te ha invitado a formar pareja de dobles! 🎾'
      });
    } catch (error) {
      console.error("❌ Error al enviar invitación dobles:", error);
    }
  }

  async responderSolicitud(notif: any, nuevoEstado: 'aceptada' | 'rechazada') {
    const miUid = this.authService.currentUserId;
    if (!miUid) return;

    const compañeroId = notif.de || notif.emisorId || notif.uid;
    if (!compañeroId) {
      this.mostrarToast('Error: No se pudo identificar al remitente.');
      return;
    }

    const notifDoc = doc(this.firestore, `usuarios/${miUid}/notificaciones/${notif.id}`);

    try {
      if (nuevoEstado === 'aceptada') {
        const perfilCompañeroSnap = await getDoc(doc(this.firestore, `perfiles/${compañeroId}`));
        const dataCompañero = perfilCompañeroSnap.data();
        const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${miUid}`));
        const miData = miPerfilSnap.data();

        const nombreRealCompañero = dataCompañero?.['infoBasica']?.nombre || dataCompañero?.['nombre'] || 'Jugador Bagels';
        const fotoRealCompañero = dataCompañero?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';
        const miNombreReal = miData?.['infoBasica']?.nombre || miData?.['nombre'] || 'Jugador Bagels';
        const miFotoReal = miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';

        // --- LÓGICA DE AMISTAD ---
        if (notif.tipo === 'amistad') {
          await addDoc(collection(this.firestore, `perfiles/${miUid}/amigos`), {
            uid: compañeroId,
            nombre: nombreRealCompañero,
            fotoURL: fotoRealCompañero,
            fechaAmistad: serverTimestamp()
          });
          await addDoc(collection(this.firestore, `perfiles/${compañeroId}/amigos`), {
            uid: miUid,
            nombre: miNombreReal,
            fotoURL: miFotoReal,
            fechaAmistad: serverTimestamp()
          });
        }

        // --- LÓGICA DE EQUIPOS DE DOBLES (PERMANENTES) ---
        if (notif.tipo === 'dobles') {
          const equiposRef = collection(this.firestore, 'equipos');
          await addDoc(equiposRef, {
            jugadores: [miUid, compañeroId],
            nombres: [miNombreReal, nombreRealCompañero],
            fechaCreacion: serverTimestamp(),
            tipo: 'dobles',
            activo: true
          });
        }

        // --- NUEVA LÓGICA: INVITACIÓN A SER PAREJA EN UN CHALLENGE (HOME) ---
        if (notif.tipo === 'invitacion_pareja_reto') {
          const datos = notif.detallesReto;
          await addDoc(collection(this.firestore, 'challenges'), {
            retadorId: notif.de, 
            retadorNombre: notif.nombreEmisor,
            companeroId: miUid,
            companeroNombre: miNombreReal,
            sede: datos.sede,
            fechaPropuesta: datos.fecha,
            horaPartido: datos.hora,
            formatoSet: datos.formato,
            tipo: 'dobles',
            estado: 'Abierto', // Para que sea visible en Home/Tab1
            timestamp: serverTimestamp()
          });
          this.mostrarToast('¡Reto de dobles publicado en Home! 🎾');
        }

        await updateDoc(notifDoc, { status: 'aceptada' });
        if (notif.tipo !== 'invitacion_pareja_reto') {
          this.mostrarToast(`¡Acción completada con ${nombreRealCompañero}! 🎉`);
        }

      } else {
        await deleteDoc(notifDoc);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      this.mostrarToast('Error al procesar la solicitud.');
    }
  }

  private async mostrarToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'dark',
      mode: 'ios'
    });
    await toast.present();
  }
}
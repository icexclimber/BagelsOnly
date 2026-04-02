import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
  IonBackButton, IonAvatar, IonIcon, IonLabel, IonListHeader, 
  IonList, IonItem, IonNote, IonSpinner, IonButton,
  AlertController, ActionSheetController, ToastController,
  NavController 
} from '@ionic/angular/standalone'; 
import { ActivatedRoute, RouterModule } from '@angular/router';
import { 
  Firestore, doc, docData, collection, addDoc, serverTimestamp,
  query, where, getDocs, deleteDoc, getDoc, collectionData
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, trophyOutline, medalOutline, 
  starOutline, tennisballOutline, locationOutline,
  peopleOutline, alertCircleOutline, personRemoveOutline,
  personAddOutline // Icono para enviar solicitud
} from 'ionicons/icons';

import { AuthService } from '../../core/services/auth.service'; 
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';

@Component({
  selector: 'app-perfil-amigo',
  templateUrl: './perfil-amigo.page.html',
  styleUrls: ['./perfil-amigo.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonBackButton, IonAvatar, IonIcon, IonLabel, IonListHeader, 
    IonList, IonItem, IonNote, IonSpinner, IonButton
  ]
})
export class PerfilAmigoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private authService = inject(AuthService); 
  private alertCtrl = inject(AlertController);
  private actionSheetCtrl = inject(ActionSheetController);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);
  
  perfilAmigo$: Observable<any> | null = null;
  esAmigo$: Observable<boolean> = of(false);

  constructor() {
    addIcons({ 
      arrowBackOutline, trophyOutline, medalOutline, 
      starOutline, tennisballOutline, locationOutline,
      peopleOutline, alertCircleOutline, personRemoveOutline,
      personAddOutline
    });
  }

  ngOnInit() {
    this.perfilAmigo$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => {
        if (!id) return of(null);
        
        const amigoRef = doc(this.firestore, `perfiles/${id}`);
        
        // --- VALIDACIÓN: ¿Ya es mi amigo? ---
        this.verificarAmistad(id);

        return docData(amigoRef).pipe(
          map(perfil => {
            if (!perfil) return null;
            return {
              id: id,
              nombre: perfil['infoBasica']?.nombre || 'Tenista',
              fotoURL: perfil['infoBasica']?.fotoURL || 'assets/img/default-avatar.png',
              nivel: perfil['infoBasica']?.nivel || '1.0',
              ubicacion: perfil['infoBasica']?.ubicacion || 'Tijuana',
              logros: perfil['logros'] || [] 
            };
          }),
          catchError(error => {
            console.error('❌ Error cargando perfil:', error);
            return of(null);
          })
        );
      })
    );
  }

  verificarAmistad(amigoId: string) {
    const miUid = this.authService.currentUserId;
    if (!miUid) return;

    // Escuchamos la subcolección de amigos del usuario actual
    const amigosRef = collection(this.firestore, `perfiles/${miUid}/amigos`);
    const q = query(amigosRef, where('uid', '==', amigoId));
    
    this.esAmigo$ = collectionData(q).pipe(
      map(amigos => amigos.length > 0),
      catchError(() => of(false))
    );
  }

  // --- SOLICITUD DE AMISTAD (Integrada para evitar NG9) ---
  async enviarSolicitudAmistad(amigo: any) {
    const miUid = this.authService.currentUserId;
    if (!miUid || !amigo.id) return;

    try {
      // 1. Obtener mis datos reales para evitar el "Tenista"
      const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${miUid}`));
      const miData = miPerfilSnap.data();

      const miNombreReal = miData?.['infoBasica']?.nombre || miData?.['nombre'] || 'Usuario Bagels';
      const miFotoReal = miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';

      const notifRef = collection(this.firestore, `usuarios/${amigo.id}/notificaciones`);

      await addDoc(notifRef, {
        de: miUid,
        para: amigo.id,
        nombreEmisor: miNombreReal,
        fotoEmisor: miFotoReal,
        status: 'pendiente',
        fecha: serverTimestamp(),
        tipo: 'amistad',
        mensaje: 'Quiere ser tu amigo'
      });

      this.mostrarToast(`¡Solicitud enviada a ${amigo.nombre}!`);
    } catch (e) {
      console.error('❌ Error al enviar solicitud:', e);
      this.mostrarToast('No se pudo enviar la solicitud.');
    }
  }

  // --- ACCIONES DE COMUNIDAD ---

  async invitarADobles(amigo: any) {
    const alert = await this.alertCtrl.create({
      header: 'Pareja de Dobles',
      message: `¿Quieres enviar una invitación a ${amigo.nombre} para formar equipo?`,
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar',
          handler: () => this.procesarInvitacionDobles(amigo)
        }
      ]
    });
    await alert.present();
  }

private async procesarInvitacionDobles(amigo: any) {
  const miUid = this.authService.currentUserId;
  if (!miUid) return;

  try {
    // 1. Obtener mi nombre real de mi perfil de Firestore
    const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${miUid}`));
    const miData = miPerfilSnap.data();
    
    // Usamos el mismo nombre de campo que el Header busca: 'nombreEmisor'
    const miNombreReal = miData?.['infoBasica']?.nombre || miData?.['nombre'] || 'Usuario Bagels';
    const miFotoReal = miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';

    const notifRef = collection(this.firestore, `usuarios/${amigo.id}/notificaciones`);
    
    await addDoc(notifRef, {
      tipo: 'dobles',
      status: 'pendiente',
      de: miUid,
      para: amigo.id,
      nombreEmisor: miNombreReal, // <-- CAMBIO CLAVE: Nombre real del perfil
      fotoEmisor: miFotoReal,     // <-- CAMBIO CLAVE: Foto real del perfil
      fecha: serverTimestamp(),
      mensaje: '¡Te ha invitado a formar pareja de dobles! 🎾'
    });
    
    this.mostrarToast(`¡Invitación enviada a ${amigo.nombre}!`);
  } catch (e) {
    console.error('❌ Error al invitar:', e);
    this.mostrarToast('No se pudo enviar la invitación.');
  }
}

  async confirmarEliminarAmigo(amigo: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Amigo',
      message: `¿Estás seguro de que quieres eliminar a ${amigo.nombre} de tu lista?`,
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Eliminar', 
          role: 'destructive',
          handler: () => this.ejecutarEliminacion(amigo)
        }
      ]
    });
    await alert.present();
  }

  private async ejecutarEliminacion(amigo: any) {
    const miUid = this.authService.currentUserId;
    const amigoId = amigo.id;

    if (!miUid || !amigoId) return;

    try {
      // 1. Borrar de MI lista
      const qMiLista = query(collection(this.firestore, `perfiles/${miUid}/amigos`), where('uid', '==', amigoId));
      const snapMiLista = await getDocs(qMiLista);
      snapMiLista.forEach(async (d) => await deleteDoc(d.ref));

      // 2. Borrar de SU lista (Reciprocidad)
      const qSuLista = query(collection(this.firestore, `perfiles/${amigoId}/amigos`), where('uid', '==', miUid));
      const snapSuLista = await getDocs(qSuLista);
      snapSuLista.forEach(async (d) => await deleteDoc(d.ref));

      this.mostrarToast(`Has eliminado a ${amigo.nombre} de tus amigos.`);
      this.navCtrl.back(); 
    } catch (e) {
      console.error("Error al eliminar:", e);
      this.mostrarToast("No se pudo eliminar al amigo.");
    }
  }

  async mostrarOpcionesReporte(amigo: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Reportar Jugador',
      subHeader: amigo.nombre,
      mode: 'ios',
      buttons: [
        { text: 'Lenguaje ofensivo', role: 'destructive', handler: () => this.enviarReporte(amigo, 'lenguaje') },
        { text: 'No se presentó al match', role: 'destructive', handler: () => this.enviarReporte(amigo, 'no-show') },
        { text: 'Nivel NTRP incorrecto', role: 'destructive', handler: () => this.enviarReporte(amigo, 'nivel-falso') },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  private async enviarReporte(amigo: any, motivo: string) {
    const miUid = this.authService.currentUserId;
    if (!miUid) return;

    try {
      await addDoc(collection(this.firestore, 'reportes'), {
        reportadoId: amigo.id,
        emisorId: miUid,
        motivo: motivo,
        fecha: serverTimestamp(),
        revisado: false
      });
      this.mostrarToast('Reporte enviado a revisión.');
    } catch (e) {
      console.error('Error al reportar:', e);
    }
  }

  async mostrarToast(msj: string) {
    const toast = await this.toastCtrl.create({
      message: msj,
      duration: 2500,
      color: 'primary',
      position: 'bottom',
      mode: 'ios'
    });
    await toast.present();
  }
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, 
  IonBadge, IonSegment, IonSegmentButton, IonLabel, IonAvatar, IonItem,
  IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonList, IonInput, IonButtons, IonSkeletonText, IonNote, IonText, IonSpinner,
  ToastController 
} from '@ionic/angular/standalone';
import { 
  Firestore, collection, query, where, orderBy, 
  collectionData, limit, doc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp 
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth.service';
import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { 
  heart, heartOutline, chatbubbleOutline, personAddOutline, 
  trophyOutline, calendarOutline, tennisballOutline, timeOutline, checkmarkCircle, sendOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, 
    IonBadge, IonSegment, IonSegmentButton, IonLabel, IonAvatar, IonItem,
    IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
    IonList, IonInput, IonButtons, IonSkeletonText, IonNote, IonText, IonSpinner
  ]
})
export class Tab2Page implements OnInit {
  private firestore = inject(Firestore);
  public auth = inject(AuthService);
  private fbAuth = inject(Auth); 
  private router = inject(Router);
  private toastCtrl = inject(ToastController);

  filtroFeed: string = 'global';
  feedItems$: Observable<any[]>;

  constructor() {
    addIcons({ 
      heart, heartOutline, chatbubbleOutline, personAddOutline, 
      trophyOutline, calendarOutline, tennisballOutline, timeOutline, checkmarkCircle, sendOutline
    });
    
    // 1. Referencias a colecciones
    const torneosRef = collection(this.firestore, 'torneos'); 
    const escalerasRef = collection(this.firestore, 'escaleras');
    const partidosRef = collection(this.firestore, 'challenges');

    // 2. Definición de Observables base
    const torneos$ = collectionData(query(torneosRef, orderBy('fechaCreacion', 'desc'), limit(10)), { idField: 'id' }).pipe(
      map(items => items.map(i => ({ 
        ...i, 
        feedType: 'torneo_nuevo',
        nombre: i['basica']?.titulo || i['nombre'] || 'Nuevo Torneo',
        color: i['basica']?.colorLayout || 'primary'
      }))),
      catchError(err => { console.error("Error Torneos:", err); return of([]); })
    );

    const escaleras$ = collectionData(query(escalerasRef, orderBy('timestamp', 'desc'), limit(10)), { idField: 'id' }).pipe(
      map(items => items.map(i => ({ 
        ...i, 
        feedType: 'escalera_nueva',
        nombre: i['nombre'] || 'Ranking Activo'
      }))),
      catchError(err => { console.error("Error Escaleras:", err); return of([]); })
    );

    const resultados$ = collectionData(query(partidosRef, where('estado', '==', 'terminado'), orderBy('fechaFinalizado', 'desc'), limit(20)), { idField: 'id' }).pipe(
      map(items => items.map(i => ({ ...i, feedType: 'resultado_match' }))),
      catchError(err => { console.error("Error Resultados:", err); return of([]); })
    );

    // 3. Lógica Maestra del Feed
    this.feedItems$ = this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        
        return combineLatest([torneos$, escaleras$, resultados$]).pipe(
          switchMap(([t, e, r]) => {
            // Unificamos y ordenamos por fecha descendente
            const combined = [...t, ...e, ...r].sort((a: any, b: any) => {
              const dateA = (a.fechaCreacion || a.timestamp || a.fechaFinalizado)?.toDate().getTime() || 0;
              const dateB = (b.fechaCreacion || b.timestamp || b.fechaFinalizado)?.toDate().getTime() || 0;
              return dateB - dateA;
            });

            // Mapeamos cada item para cargar sus comentarios de forma aislada
            const itemsConComentarios$ = combined.map((item: any) => {
              const colPath = `${this.getColRef(item.feedType)}/${item.id}/comentarios`;
              const resfComents = collection(this.firestore, colPath);
              const qComents = query(resfComents, orderBy('timestamp', 'asc'), limit(5));
              
              return collectionData(qComents).pipe(
                map(comentarios => ({ ...item, ultimosComentarios: comentarios })),
                // Si fallan los permisos de un comentario específico, devolvemos el item vacío para no romper el feed
                catchError(err => {
                  console.warn(`Permiso denegado para comentarios en ${item.id}`);
                  return of({ ...item, ultimosComentarios: [] });
                })
              );
            });

            return itemsConComentarios$.length > 0 ? combineLatest(itemsConComentarios$) : of([]);
          }),
          tap(data => console.log("Items en Feed Global:", data.length)),
          catchError(err => {
            console.error("Error Crítico en Feed:", err);
            return of([]);
          })
        );
      })
    );
  }

  ngOnInit() {}

  async reaccionar(item: any) {
    const uid = this.auth.currentUserId;
    if (!uid) return;
    const itemRef = doc(this.firestore, `${this.getColRef(item.feedType)}/${item.id}`);
    const isLiked = item.likes?.includes(uid);
    try {
      await updateDoc(itemRef, {
        likes: isLiked ? arrayRemove(uid) : arrayUnion(uid)
      });
    } catch (e) {
      this.presentarToast('Error al reaccionar', 'danger');
    }
  }

  async comentar(item: any, comentarioInput: any) {
    const texto = comentarioInput.value;
    if (!texto || !texto.trim()) return;

    const user = this.fbAuth.currentUser; 
    if (!user) {
      this.presentarToast('Inicia sesión para comentar', 'warning');
      return;
    }

    const comentarioData = {
      usuarioId: user.uid,
      nombre: user.displayName || 'Tenista Bagels',
      foto: user.photoURL || 'assets/img/bancario.jpg',
      texto: texto.trim(),
      timestamp: serverTimestamp()
    };

    try {
      const colPath = `${this.getColRef(item.feedType)}/${item.id}/comentarios`;
      await addDoc(collection(this.firestore, colPath), comentarioData);
      
      comentarioInput.value = ''; 
      this.presentarToast('Comentario publicado 🎾', 'success');
    } catch (e) {
      console.error("Error al guardar comentario:", e);
      this.presentarToast('Error de permisos', 'danger');
    }
  }

  async presentarToast(msj: string, color: string) {
    const t = await this.toastCtrl.create({ 
      message: msj, 
      color, 
      duration: 2000, 
      position: 'top', 
      mode: 'ios' 
    });
    t.present();
  }

  verPerfil(usuarioId: string) {
    if (usuarioId) this.router.navigate(['/perfil-detalle', usuarioId]);
  }

  private getColRef(type: string): string {
    switch(type) {
      case 'torneo_nuevo': return 'torneos';
      case 'escalera_nueva': return 'escaleras';
      case 'resultado_match': return 'challenges';
      default: return 'challenges';
    }
  }
}
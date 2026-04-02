import { Injectable, inject } from '@angular/core';
import { 
  Firestore, collection, query, where, orderBy, 
  collectionData, doc, docData, setDoc, updateDoc 
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

// 1. Interface robusta (incluye roles para evitar errores de compilación)
export interface PerfilTenista {
  uid: string;
  infoBasica: {
    nombre: string;
    nombreLower: string;
    fotoURL?: string;
    bio?: string;
    nivel: string;
    ubicacion: string;
    manoDominante?: string;
    canchasFrecuentes?: string[];
  };
  roles?: {
    isAdmin: boolean;
    role: string;
  };
  stats: {
    xpActual: number;
    puntos: number;
    victorias: number;
    derrotas: number;
    partidos: number;
    streak: number;
    record: {
      ganados: number;
      perdidos: number;
    };
  };
  bentoUI?: {
    actividadMensual: number[];
    historiaChallenges: any[];
    progresoRango: number;
    topPercentil: number;
  };
  winRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RankingsService {
  public firestore = inject(Firestore);
  public auth = inject(Auth);
  private storage = inject(Storage);

  usuarioActual$: Observable<PerfilTenista | null>;

  constructor() {
    this.usuarioActual$ = authState(this.auth).pipe(
      switchMap(authUser => {
        if (!authUser) return of(null);
        const userDocRef = doc(this.firestore, `perfiles/${authUser.uid}`);
        
        return (docData(userDocRef, { idField: 'uid' }) as Observable<PerfilTenista>).pipe(
          map(data => this.calcularWinRate(data)),
          catchError(error => {
            console.error('❌ Error en RankingsService:', error);
            return of(null);
          })
        );
      })
    );
  }

  private calcularWinRate(perfil: PerfilTenista | null): PerfilTenista | null {
    if (!perfil || !perfil.stats?.record) return perfil;
    const { ganados, perdidos } = perfil.stats.record;
    const total = (ganados || 0) + (perdidos || 0);
    perfil.winRate = total > 0 ? Math.round((ganados / total) * 100) : 0;
    return perfil;
  }

  // Permite actualizaciones parciales usando "dot.notation"
  async updateUserData(uid: string, data: Record<string, any>) {
    const userRef = doc(this.firestore, `perfiles/${uid}`);
    return await updateDoc(userRef, data);
  }

  async uploadImage(uid: string, base64: string): Promise<string> {
    const path = `fotos_perfil/${uid}.jpg`;
    const storageRef = ref(this.storage, path);
    // Nota: Asegúrate de que el string base64 no incluya el prefijo "data:image/jpeg;base64,"
    await uploadString(storageRef, base64, 'base64', { contentType: 'image/jpeg' }); 
    return await getDownloadURL(storageRef);
  }

  // Ranking optimizado para buscar en los nuevos mapas
  getRankingPorSede(sede: string = 'Tijuana'): Observable<PerfilTenista[]> {
    const perfilesRef = collection(this.firestore, 'perfiles');
    const consulta = query(
      perfilesRef,
      where('infoBasica.ubicacion', '==', sede),
      orderBy('stats.puntos', 'desc')
    );
    return collectionData(consulta, { idField: 'uid' }) as Observable<PerfilTenista[]>;
  }
}
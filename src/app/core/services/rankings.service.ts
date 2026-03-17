import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { 
  Firestore, collection, query, where, orderBy, 
  collectionData, doc, docData, setDoc 
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';

export interface PerfilTenista {
  uid: string;
  nombre: string;
  foto?: string;
  descripcion?: string;
  xp: number;
  nivel: number;
  ubicacion: string;
  bagelsEntregados: number;
  bannerSeleccionado?: string;
  sede?: string; 
  mano?: string;
  estilo?: string;
  record: {
    ganados: number;
    perdidos: number;
  };
  winRate?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RankingsService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private injector = inject(Injector);

  usuarioActual$: Observable<PerfilTenista | null>;

  constructor() {
    this.usuarioActual$ = user(this.auth).pipe(
      tap(authUser => console.log('Auth State:', authUser ? `Logueado como ${authUser.email}` : 'No logueado')),
      switchMap(authUser => {
        if (!authUser) return of(null);

        return runInInjectionContext(this.injector, () => {
          const userDocRef = doc(this.firestore, `perfiles/${authUser.uid}`);
          
          return (docData(userDocRef, { idField: 'uid' }) as Observable<PerfilTenista>).pipe(
            switchMap(data => {
              // 🚀 Lógica de Auto-Creación si el perfil es undefined
              if (!data) {
                console.warn('Perfil no encontrado en Firestore. Creando perfil inicial...');
                const nuevoPerfil: PerfilTenista = {
                  uid: authUser.uid,
                  nombre: authUser.displayName || 'Nuevo Tenista',
                  foto: authUser.photoURL || '',
                  xp: 0,
                  nivel: 1.0,
                  ubicacion: 'Tijuana', // Por defecto para BagelsOnly
                  bagelsEntregados: 0,
                  record: { ganados: 0, perdidos: 0 }
                };

                // Creamos el documento y retornamos el objeto para que la app cargue
                return from(setDoc(userDocRef, nuevoPerfil)).pipe(
                  map(() => nuevoPerfil),
                  tap(() => console.log('✅ Perfil creado exitosamente'))
                );
              }

              console.log('✅ Datos de Firestore cargados:', data.nombre);
              return of(this.calcularWinRate(data));
            }),
            catchError(error => {
              console.error('❌ Error crítico en RankingsService:', error);
              return of(null);
            })
          );
        });
      })
    );
  }

  private calcularWinRate(perfil: PerfilTenista | null): PerfilTenista | null {
    if (!perfil || !perfil.record) return perfil;
    const ganados = perfil.record.ganados || 0;
    const perdidos = perfil.record.perdidos || 0;
    const total = ganados + perdidos;
    perfil.winRate = total > 0 ? Math.round((ganados / total) * 100) : 0;
    return perfil;
  }

async uploadImage(uid: string, base64: string): Promise<string> {
  const path = `fotos_perfil/${uid}.jpg`;
  const storageRef = ref(this.storage, path);
  
  // Añadimos metadatos para ayudar al navegador y a CORS
  const metadata = {
    contentType: 'image/jpeg',
  };

  try {
    // Usamos uploadString con el formato data_url que envía la cámara
    await uploadString(storageRef, base64, 'data_url', metadata); 
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error en la subida:", error);
    throw error;
  }
}

  async updateUserData(uid: string, data: Partial<PerfilTenista>) {
    return runInInjectionContext(this.injector, () => {
      const userDocRef = doc(this.firestore, `perfiles/${uid}`);
      return setDoc(userDocRef, data, { merge: true });
    });
  }

  getRankingPorCiudad(ciudad: string): Observable<PerfilTenista[]> {
    return runInInjectionContext(this.injector, () => {
      const perfilesRef = collection(this.firestore, 'perfiles');
      const consulta = query(
        perfilesRef,
        where('ubicacion', '==', ciudad),
        orderBy('xp', 'desc')
      );
      return collectionData(consulta, { idField: 'uid' }) as Observable<PerfilTenista[]>;
    });
  }
}
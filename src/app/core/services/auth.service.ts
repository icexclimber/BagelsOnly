import { Injectable, inject, NgZone } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user,
  User
} from '@angular/fire/auth';
import { Router } from '@angular/router';
// CORRECCIÓN: Importaciones oficiales de AngularFire Firestore
import { Firestore, doc, setDoc } from '@angular/fire/firestore'; 
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private zone = inject(NgZone);

  // Observable que escucha el estado de la sesión
  user$: Observable<User | null>;

  constructor() {
    this.user$ = user(this.auth);
  }

  // --- GETTERS ---
  get currentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  // --- MÉTODO CORREGIDO: getCurrentUser ---
  // Este método resuelve el error TS2551 en Splash, Tab1 y SetupPerfil
  async getCurrentUser(): Promise<User | null> {
    try {
      return await firstValueFrom(this.user$);
    } catch (error) {
      return null;
    }
  }

  // --- REGISTRO CON ARQUITECTURA DE MAPS ---
  async registro(email: string, pass: string, nombre: string, token: string = '') {
    try {
      // 1. Crear el usuario en Firebase Auth
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const uid = credential.user.uid;

      // 2. Definir el objeto con la estructura de MAPS (Carpetas grises en Firestore)
      const perfilEstructurado = {
        id: uid,
        infoBasica: {
          nombre: nombre,
          nombreLower: nombre.toLowerCase(),
          nivel: '1.0',
          bio: '¡Listo para el set!',
          manoDominante: 'Derecho',
          ubicacion: '',
          nivelVerificado: false,
          fotoURL: '', 
          createdAt: new Date(),
          lastActive: new Date()
        },
        roles: { isAdmin: false, role: 'player' },
        stats: {
          puntos: 0, victorias: 0, derrotas: 0, partidos: 0,
          xpActual: 0, streak: 0, bestStreak: 0,
          bagels: { bagelsAFavor: 0, bagelsEnContra: 0 },
          tiebrakes: { ganados: 0, perdidos: 0 }
        },
        bentoUI: {
          actividadMensual: [], 
          historiaChallenges: [],
          challengesJugados: 0, 
          sesionesEntreno: 0,
          checkInsTotales: 0, 
          topPercentil: 100, 
          progresoRango: 0
        },
        social: {
          amigos: [], solicitudesRecibidas: [], partnerId: null,
          misTorneos: [], misEscaleras: [], siguiendoCompetencia: []
        },
        interacciones: {
          dadas: { comentarios: 0, reacciones: 0 },
          recibidas: { comentarios: 0, reacciones: 0 }
        },
        comunicaciones: { chatsActivos: [], pushToken: token, unreadCount: 0 }
      };

      // 3. Guardar el documento usando el UID como nombre del documento
      const docRef = doc(this.firestore, `perfiles/${uid}`);
      await setDoc(docRef, perfilEstructurado);

      return true;
    } catch (error) {
      console.error("Error en Registro:", error);
      throw error;
    }
  }

  // --- LOGIN ---
  async login(email: string, pass: string) {
    return this.zone.run(async () => {
      try {
        const credenciales = await signInWithEmailAndPassword(this.auth, email, pass);
        // Redirigir a la ruta principal de tu app
        await this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        return credenciales;
      } catch (error) {
        console.error("Error en Login:", error);
        throw error;
      }
    });
  }

  // --- LOGOUT ---
  async logout() {
    return this.zone.run(async () => {
      try {
        await signOut(this.auth);
        await this.router.navigate(['/login'], { replaceUrl: true });
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    });
  }
}
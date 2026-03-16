import { Injectable, inject, NgZone } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private zone = inject(NgZone);

  user$ = user(this.auth);

  async registro(email: string, pass: string, nombre: string) {
    // 1. Todo el proceso debe ocurrir dentro de zone.run para que Angular lo "vea"
    return this.zone.run(async () => {
      try {
        // 2. Registro en Firebase Auth
        const credenciales = await createUserWithEmailAndPassword(this.auth, email, pass);
        
        // 3. Guardado en Firestore
        await setDoc(doc(this.firestore, `perfiles/${credenciales.user.uid}`), {
          nombre: nombre,
          email: email,
          nivel: "2.5", 
          xp: 0,
          bagelsEntregados: 0,
          record: { ganados: 0, perdidos: 0 },
          descripcion: "",
          uid: credenciales.user.uid // Recomendado guardar el UID dentro del doc
        });

        // 4. NAVEGACIÓN: Usar await y asegurar el contexto
        // Si '/tabs/tab1' es tu ruta de Dashboard, esto disparará el Onboarding
        const navego = await this.router.navigate(['/tabs/tab1'], { 
          queryParams: { nuevoUsuario: true },
          replaceUrl: true 
        });

        console.log('¿Navegación exitosa?:', navego);
        return credenciales;

      } catch (error) {
        console.error("Error en AuthService.registro:", error);
        throw error; 
      }
    });
  }

  async login(email: string, pass: string) {
    return this.zone.run(async () => {
      try {
        const credenciales = await signInWithEmailAndPassword(this.auth, email, pass);
        await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
        return credenciales;
      } catch (error) {
        throw error;
      }
    });
  }

  async logout() {
    return this.zone.run(async () => {
      await signOut(this.auth);
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    });
  }
}
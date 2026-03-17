import { Injectable, inject, NgZone } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  user,
  updateProfile
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs'; // 👈 LA SOLUCIÓN: Viene de 'rxjs', no de '@angular/fire'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private zone = inject(NgZone);

  user$ = user(this.auth);

  async registro(email: string, pass: string, nombre: string) {
    return this.zone.run(async () => {
      try {
        const credenciales = await createUserWithEmailAndPassword(this.auth, email, pass);
        await updateProfile(credenciales.user, { displayName: nombre });
        
        // Redirigimos al Onboarding
        await this.router.navigate(['/setup-perfil'], { replaceUrl: true });
        return credenciales;
      } catch (error) {
        console.error("Error en Registro:", error);
        throw error; 
      }
    });
  }

  async login(email: string, pass: string) {
    return this.zone.run(async () => {
      try {
        const credenciales = await signInWithEmailAndPassword(this.auth, email, pass);
        await this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        return credenciales;
      } catch (error) {
        throw error;
      }
    });
  }

  // Ahora sí funcionará correctamente
  async getCurrentUser() {
    return await firstValueFrom(this.user$);
  }

  async logout() {
    return this.zone.run(async () => {
      await signOut(this.auth);
      await this.router.navigate(['/login'], { replaceUrl: true });
    });
  }
}
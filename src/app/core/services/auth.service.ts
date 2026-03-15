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
  // Inyección de dependencias moderna
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private zone = inject(NgZone); // 👈 Crucial para la estabilidad de la App

  // Observable para monitorear al usuario en toda la app
  user$ = user(this.auth);

  /**
   * Registra un nuevo tenista y crea su perfil en la base de datos
   */
  async registro(email: string, pass: string, nombre: string) {
    // Forzamos la ejecución dentro de la zona de Angular para evitar errores de contexto
    return this.zone.run(async () => {
      const credenciales = await createUserWithEmailAndPassword(this.auth, email, pass);
      
      // Creamos el documento del perfil con los stats iniciales de BagelsOnly
      await setDoc(doc(this.firestore, `perfiles/${credenciales.user.uid}`), {
        nombre: nombre,
        email: email,
        nivel: 1.0,
        xp: 0,
        bagelsEntregados: 0,
        record: { ganados: 0, perdidos: 0 }
      });
      
      return credenciales;
    });
  }

  /**
   * Inicia sesión y redirige al Tab principal (Perfil)
   */
  async login(email: string, pass: string) {
    return this.zone.run(async () => {
      const credenciales = await signInWithEmailAndPassword(this.auth, email, pass);
      
      // replaceUrl: true evita que el usuario regrese al login con el botón 'atrás'
      this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      
      return credenciales;
    });
  }

  /**
   * Cierra la sesión y regresa al login
   */
  async logout() {
    return this.zone.run(async () => {
      await signOut(this.auth);
      this.router.navigateByUrl('/login', { replaceUrl: true });
    });
  }
}
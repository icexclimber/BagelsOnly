import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // 1. Definimos los datos iniciales
  private initialData = {
  nombre: 'Tu Nombre',
  nivel: '4.5',
  xp: 450,
  record: { ganados: 15, perdidos: 5 },
  bagelsEntregados: 3,
  foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  descripcion: 'Tenista de la AMT | Tijuana'
};

  // 2. Creamos un "Subject" que emite los cambios
  private userSubject = new BehaviorSubject<any>(this.initialData);
  
  // 3. Exponemos los datos como un Observable
  user$ = this.userSubject.asObservable();

  constructor() {}

  // Obtener el valor actual una sola vez
  getUsuarioActual() {
    return this.userSubject.value;
  }

  // Método para actualizar cualquier dato y notificar a la app
  updateUsuario(nuevosDatos: any) {
    const currentData = this.userSubject.value;
    this.userSubject.next({ ...currentData, ...nuevosDatos });
  }

  updateFoto(nuevaFoto: string) {
    this.updateUsuario({ foto: nuevaFoto });
  }
}
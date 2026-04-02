// src/app/core/services/torneos.service.ts
import { inject, Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, collectionData } from '@angular/fire/firestore';
import { RankingsService } from './rankings.service'; // Para obtener el usuario loggeado
import { switchMap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TorneosService {
  private firestore = inject(Firestore);
  private rankingsService = inject(RankingsService);

  // Guardar un nuevo torneo vinculado al UID del usuario
  async guardarTorneo(torneo: any, uid: string) {
    const torneosRef = collection(this.firestore, 'torneos');
    return addDoc(torneosRef, {
      ...torneo,
      creadorId: uid, // Clave para la persistencia por usuario
      fechaCreacion: new Date()
    });
  }

  // Obtener solo los torneos del usuario loggeado
  getMisTorneos(): Observable<any[]> {
    return this.rankingsService.usuarioActual$.pipe(
      switchMap(user => {
        if (!user) return of([]);
        const torneosRef = collection(this.firestore, 'torneos');
        const q = query(torneosRef, where('creadorId', '==', user.uid));
        return collectionData(q, { idField: 'id' });
      })
    );
  }
}
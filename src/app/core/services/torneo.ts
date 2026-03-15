import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, arrayUnion } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class TorneoService {
  private firestore = inject(Firestore);

  // Obtener todos los torneos activos
  getTorneos() {
    const torneosRef = collection(this.firestore, 'torneos');
    return collectionData(torneosRef, { idField: 'id' });
  }

  // Inscribir a un jugador a un torneo
  async inscribirJugador(torneoId: string, jugadorId: string) {
    const torneoRef = doc(this.firestore, 'torneos', torneoId);
    return updateDoc(torneoRef, {
      participantes: arrayUnion(jugadorId)
    });
  }
}
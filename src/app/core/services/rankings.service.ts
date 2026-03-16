import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  collectionData 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RankingsService {
  // Inyectamos Firestore usando la sintaxis moderna
  private firestore = inject(Firestore);

  /**
   * Obtiene la lista de jugadores filtrada por ciudad y ordenada por puntos
   * @param ciudad 'Tijuana' | 'Ensenada' | 'Rosarito'
   */
  getRankingPorCiudad(ciudad: string): Observable<any[]> {
    // 1. Referencia a la colección de perfiles que ya usas en el registro
    const perfilesRef = collection(this.firestore, 'perfiles');

    // 2. Creamos la consulta: Filtra por ubicación y ordena por XP (puntos)
    const consultaRanking = query(
      perfilesRef,
      where('ubicacion', '==', ciudad),
      orderBy('xp', 'desc')
    );

    // 3. Retornamos los datos con el ID del documento incluido
    return collectionData(consultaRanking, { idField: 'id' }) as Observable<any[]>;
  }
}
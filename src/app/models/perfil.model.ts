export interface PerfilTennis {
  id: string;
  infoBasica: {
    nombre: string;
    nombreLower: string;
    nivel: string;
    bio: string;
    manoDominante: string;
    ubicacion: string;
    nivelVerificado: boolean;
    createdAt: any;
    lastActive: any;
  };
  roles: {
    isAdmin: boolean;
    role: string;
  };
  stats: {
    puntos: number;
    victorias: number;
    derrotas: number;
    partidos: number;
    xpActual: number;
    streak: number;
    bestStreak: number;
    bagels: {
      bagelsAFavor: number;
      bagelsEnContra: number;
    };
    tiebrakes: {
      ganados: number;
      perdidos: number;
    };
  };
  bentoUI: {
    actividadMensual: string[];
    historiaChallenges: string[];
    challengesJugados: number;
    sesionesEntreno: number;
    checkInsTotales: number;
    topPercentil: number;
    progresoRango: number; 
  };
  social: {
    amigos: string[];
    solicitudesRecibidas: [];
    partnerId: string | null;
    misTorneos: string[];
    misEscaleras: string[];
    siguiendoCompetencia: string[];
  };
  interacciones: {
    dadas: {
      comentarios: number;
      reacciones: number;
    };
    recibidas: {
      comentarios: number;
      reacciones: number;
    };
  };
  comunicaciones: {
    chatsActivos: string[];
    pushToken: string;
    unreadCount: number;
  };
}

// Objeto inicial para evitar errores de "undefined" en el HTML
export const INITIAL_PERFIL: PerfilTennis = {
  id: '',
  infoBasica: {
    nombre: '',
    nombreLower: '',
    nivel: '1.0',
    bio: '',
    manoDominante: 'Derecho',
    ubicacion: '',
    nivelVerificado: false,
    createdAt: null,
    lastActive: null
  },
  roles: { isAdmin: false, role: 'player' },
  stats: {
    puntos: 0, victorias: 0, derrotas: 0, partidos: 0,
    xpActual: 0, streak: 0, bestStreak: 0,
    bagels: { bagelsAFavor: 0, bagelsEnContra: 0 },
    tiebrakes: { ganados: 0, perdidos: 0 }
  },
  bentoUI: {
    actividadMensual: [], historiaChallenges: [],
    challengesJugados: 0, sesionesEntreno: 0,
    checkInsTotales: 0, topPercentil: 0, progresoRango: 0
  },
  social: {
    amigos: [], solicitudesRecibidas: [], partnerId: null,
    misTorneos: [], misEscaleras: [], siguiendoCompetencia: []
  },
  interacciones: {
    dadas: { comentarios: 0, reacciones: 0 },
    recibidas: { comentarios: 0, reacciones: 0 }
  },
  comunicaciones: { chatsActivos: [], pushToken: '', unreadCount: 0 }
};
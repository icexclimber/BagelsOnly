import { Component, OnInit, inject, OnDestroy, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonSegment, IonSegmentButton, 
  IonLabel, IonList, IonListHeader, IonItem, IonIcon, IonBadge, IonGrid, 
  IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonButton,
  IonProgressBar, IonText, IonThumbnail, IonCardTitle, IonCardContent,
  IonNote, IonFab, IonFabButton, ToastController, IonModal, IonButtons, IonInput, IonSelect, IonSelectOption 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  tennisballOutline, trophyOutline, lockClosedOutline, medalOutline, 
  calendarOutline, flashOutline, starOutline, flameOutline,
  checkmarkDoneOutline, personOutline, ribbonOutline,
  checkmarkCircle, saveOutline, timeOutline, addCircle, flash, locationOutline, flame, alertCircleOutline, fitnessOutline, hourglassOutline, trashOutline, closeOutline, tennisball,
  peopleOutline, personAddOutline 
} from 'ionicons/icons';

import { HeaderGlobalComponent } from '../../core/components/header-global/header-global.component';
import { RankingsService } from '../../core/services/rankings.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, combineLatest } from 'rxjs';
import { Firestore, arrayUnion, collection, addDoc, query, where, onSnapshot, orderBy, doc, updateDoc, increment, serverTimestamp, collectionData, limit, deleteDoc, getDocs, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HeaderGlobalComponent,
    IonContent, IonHeader, IonToolbar, IonTitle, IonSegment, IonSegmentButton, 
    IonLabel, IonList, IonListHeader, IonItem, IonIcon, IonBadge, IonGrid, 
    IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonButton,
    IonProgressBar, IonText, IonThumbnail, IonCardTitle, IonCardContent,
    IonNote, IonFab, IonFabButton, IonModal, IonButtons, IonInput, IonSelect, IonSelectOption
  ]
})
export class Tab3Page implements OnInit, OnDestroy {
  private rankingsService = inject(RankingsService);
  public authService = inject(AuthService);
  private firestore = inject(Firestore);
  private toastCtrl = inject(ToastController);
  private subscripcion = new Subscription();
  private injector = inject(EnvironmentInjector);

  // --- ESTADO DE LA UI ---
  segmentoActual: string = 'actividad';
  bannerTemporal: any = null; 
  isModalRetoOpen = false;
  isModalScoreOpen = false;

  // --- LÓGICA DE RETOS/MATCHES ---
  retoSeleccionado: any = null;
  marcadorFinal: string = '';
  ganoPartido: boolean = true;

  // 🎾 scoreInputs para manejar los 3 sets por separado
  scoreInputs = {
    s1: '',
    s2: '',
    s3: ''
  };

  proximasFechas: any[] = [];
  
  nuevoReto = { 
    sede: 'CDB', 
    fecha: '', 
    nivelRival: 'C',
    hora: '18:00', // Formato militar HH:mm para compatibilidad
    formato: '2 de 3 sets',
    tipo: 'sencillos', 
    companeroId: null as string | null
  };

  usuarioStats = {
    nivel: 1.0,
    xp: 0,           
    xpSiguienteNivel: 1000,
    racha: 0,        
    nombre: 'Tu Nombre'
  };

  // --- DATA SOURCES ---
  retosPendientes: any[] = [];
  actividades: any[] = [];
  listaAmigos: any[] = []; 
  readonly LIMITE_CHALLENGES = 7;

  logros = [
    { id: 'b1', titulo: 'Rey de Tijuana', requisito: '10 victorias locales', imagen: 'assets/banners/tijuana.png', desbloqueado: true, activo: true, raridad: 'Épico' },
    { id: 'b3', titulo: 'Bagel Master', requisito: 'Gana un set 6-0', imagen: 'assets/banners/bagel.png', desbloqueado: true, activo: false, raridad: 'Legendario' },
    { id: 'b5', titulo: 'Guerrero del Sol', requisito: 'Juega a mediodía (30°C+)', imagen: 'assets/banners/sun.png', desbloqueado: true, activo: false, raridad: 'Raro' },
    { id: 'b6', titulo: 'AMT Fundador', requisito: 'Usuario desde Beta', imagen: 'assets/banners/beta.png', desbloqueado: true, activo: false, raridad: 'Diamante' }
  ];

  constructor() {
    addIcons({ 
      tennisballOutline, trophyOutline, lockClosedOutline, medalOutline, 
      calendarOutline, flashOutline, starOutline, flameOutline,
      checkmarkDoneOutline, personOutline, ribbonOutline, checkmarkCircle,
      saveOutline, timeOutline, addCircle, flash, locationOutline, flame,
      fitnessOutline, hourglassOutline, alertCircleOutline, trashOutline, closeOutline, tennisball,
      peopleOutline, personAddOutline
    });
  }

  // ==========================================================================
  // 🎾 GETTERS PARA FILTRADO DINÁMICO
  // ==========================================================================
  
  get actividadesFiltradas() {
    if (this.segmentoActual === 'actividad') return this.actividades;

    return this.actividades.filter(item => {
      const tipo = item.tipo?.toLowerCase();
      if (this.segmentoActual === 'matches') {
        return tipo === 'sencillos' || tipo === 'amistoso' || tipo === 'dobles' || tipo === 'torneo';
      }
      if (this.segmentoActual === 'entrenamientos') {
        return tipo === 'entrenamiento' || tipo === 'clase';
      }
      return true;
    });
  }

  get progresoXP() { 
    return (this.usuarioStats.xp % this.usuarioStats.xpSiguienteNivel) / this.usuarioStats.xpSiguienteNivel; 
  }

  get limiteAlcanzado(): boolean { 
    return this.retosPendientes.length >= this.LIMITE_CHALLENGES; 
  }

  // ==========================================================================
  // ⚡ CICLO DE VIDA Y CARGA DE DATOS
  // ==========================================================================

  ngOnInit() {
    this.generarProximasFechas();
    this.escucharRetosEnTiempoReal();
    this.escucharActividadReciente();
    this.cargarMisAmigos(); 
    
    this.subscripcion.add(
      this.rankingsService.usuarioActual$.subscribe((perfil: any) => {
        if (perfil) {
          this.usuarioStats.xp = perfil.xp || perfil.xpActual || (perfil.stats?.puntos) || 0;
          this.usuarioStats.racha = perfil.racha || (perfil.stats?.streak) || 0;
          this.usuarioStats.nivel = perfil.nivel || (perfil.infoBasica?.nivel) || 1.0;
          this.usuarioStats.nombre = perfil.nombre || perfil.infoBasica?.nombre || 'Tenista';
          
          if (perfil.bannerSeleccionado) {
            this.logros.forEach(l => l.activo = (l.id === perfil.bannerSeleccionado));
          }
        }
      })
    );
  }

  async cargarMisAmigos() {
    const uid = this.authService.currentUserId;
    if (!uid) return;
    try {
      const amigosRef = collection(this.firestore, `perfiles/${uid}/amigos`);
      const snap = await getDocs(amigosRef);
      this.listaAmigos = snap.docs.map(d => ({
        uid: d.data()['uid'],
        nombre: d.data()['nombre']
      }));
    } catch (e) { console.error("Error cargando amigos:", e); }
  }

  // ==========================================================================
  // 🔥 FIREBASE: ESCUCHAS EN TIEMPO REAL
  // ==========================================================================

  escucharRetosEnTiempoReal() {
    this.subscripcion.add(
      this.authService.user$.subscribe(user => {
        if (user?.uid) {
          runInInjectionContext(this.injector, () => {
            const colRef = collection(this.firestore, 'challenges');
            const qRetador = query(colRef, where('retadorId', '==', user.uid), where('estado', 'in', ['Abierto', 'Aceptado', 'Pendiente_Confirmacion']), orderBy('timestamp', 'desc'));
            const qRival = query(colRef, where('rivalId', '==', user.uid), where('estado', 'in', ['Aceptado', 'Pendiente_Confirmacion']), orderBy('timestamp', 'desc'));
            const obsRetador = collectionData(qRetador, { idField: 'id' });
            const obsRival = collectionData(qRival, { idField: 'id' });
            this.subscripcion.add(
              combineLatest([obsRetador, obsRival]).subscribe(([retosA, retosB]) => {
                const todos = [...retosA, ...retosB];
                this.retosPendientes = todos.filter((v, i, a) => a.findIndex(t => t['id'] === v['id']) === i);
              })
            );
          });
        }
      })
    );
  }

  escucharActividadReciente() {
    this.subscripcion.add(
      this.authService.user$.subscribe(user => {
        if (user?.uid) {
          runInInjectionContext(this.injector, () => {
            const colRef = collection(this.firestore, 'challenges');
            const qFinalizados = query(colRef, where('estado', '==', 'Finalizado'), limit(20));
            
            const unsub = onSnapshot(qFinalizados, (snapshot) => {
              const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              this.actividades = matches
                .filter((m: any) => m.retadorId === user.uid || m.rivalId === user.uid)
                .map((m: any) => {
                  const soyRetador = m.retadorId === user.uid;
                  const soyGanador = m.ganadorId === user.uid;
                  let fechaJS = m.fechaFinalizacion ? new Date(m.fechaFinalizacion.seconds * 1000) : new Date();
                  return {
                    nombre: m.tipo === 'entrenamiento' ? 'Entrenamiento' : `vs ${soyRetador ? (m.rivalNombre || 'Rival') : m.retadorNombre}`,
                    detalle: m.sede || 'Tijuana',
                    fecha: fechaJS,
                    resultado: m.resultado || 'Finalizado',
                    gano: soyGanador,
                    puntos: soyGanador ? 150 : 50,
                    tipo: m.tipo || 'amistoso'
                  };
                })
                .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
            });
            this.subscripcion.add(new Subscription(() => unsub()));
          });
        }
      })
    );
  }

  // ==========================================================================
  // 🎾 ACCIONES DE USUARIO (RETO, SCORE, LOGROS)
  // ==========================================================================

  async publicarReto() {
    const uid = this.authService.currentUserId;
    if (!uid) return;
    if (this.limiteAlcanzado) {
      this.presentarToast(`Límite alcanzado. Máximo ${this.LIMITE_CHALLENGES} retos.`, 'warning');
      return;
    }

    runInInjectionContext(this.injector, async () => {
      try {
        const miPerfilSnap = await getDoc(doc(this.firestore, `perfiles/${uid}`));
        const miData = miPerfilSnap.data();
        const miNombre = miData?.['infoBasica']?.nombre || 'Tenista';
        const miFoto = miData?.['infoBasica']?.fotoURL || 'assets/img/default-avatar.png';

        if (this.nuevoReto.tipo === 'dobles') {
          if (!this.nuevoReto.companeroId) return this.presentarToast('Selecciona compañero', 'warning');
          const notifRef = collection(this.firestore, `usuarios/${this.nuevoReto.companeroId}/notificaciones`);
          await addDoc(notifRef, {
            tipo: 'invitacion_pareja_reto', status: 'pendiente', de: uid, nombreEmisor: miNombre, fotoEmisor: miFoto,
            mensaje: `Te invita a ser su pareja en ${this.nuevoReto.sede}`, detallesReto: { ...this.nuevoReto, retadorNombre: miNombre }, fecha: serverTimestamp()
          });
          this.presentarToast('Invitación enviada.', 'success');
        } else {
          const challengeData = {
            retadorId: uid, retadorNombre: miNombre, ntrpRetador: miData?.['infoBasica']?.nivel || 1.0,
            // Guardamos solo el string de la fecha para evitar desfase de zona horaria
            fechaPropuesta: this.nuevoReto.fecha.split('T')[0], 
            horaPartido: this.nuevoReto.hora, 
            formatoSet: this.nuevoReto.formato,
            sede: this.nuevoReto.sede, estado: 'Abierto', tipo: 'sencillos', timestamp: serverTimestamp()
          };
          await addDoc(collection(this.firestore, 'challenges'), challengeData);
          this.presentarToast('¡Challenge publicado!', 'success');
        }
        this.isModalRetoOpen = false;
      } catch (e) { this.presentarToast('Error al procesar', 'danger'); }
    });
  }

  async confirmarResultado() {
    const uid = this.authService.currentUserId;
    if (!uid || !this.retoSeleccionado) return;

    // Concatenación dinámica según el formato jugado
    if (this.retoSeleccionado.formatoSet === '2 de 3 sets') {
      if (!this.scoreInputs.s1 || !this.scoreInputs.s2) {
        return this.presentarToast('Ingresa al menos los dos primeros sets', 'warning');
      }
      this.marcadorFinal = `${this.scoreInputs.s1} ${this.scoreInputs.s2} ${this.scoreInputs.s3}`.trim();
    } else {
      if (!this.marcadorFinal) return this.presentarToast('Ingresa el marcador', 'warning');
    }

    runInInjectionContext(this.injector, async () => {
      try {
        const retoRef = doc(this.firestore, `challenges/${this.retoSeleccionado.id}`);
        await updateDoc(retoRef, { 
          estado: 'Pendiente_Confirmacion', 
          marcadorPropuesto: this.marcadorFinal, 
          quienRegistroId: uid, 
          ganoQuienRegistro: this.ganoPartido, 
          fechaRegistro: serverTimestamp() 
        });

        this.isModalScoreOpen = false; 
        this.resetScoreInputs(); 
        this.presentarToast('Resultado enviado. Esperando confirmación.', 'success');
      } catch (e) { this.presentarToast('Error al enviar', 'danger'); }
    });
  }

  resetScoreInputs() {
    this.marcadorFinal = '';
    this.scoreInputs = { s1: '', s2: '', s3: '' };
  }

  async validarResultadoRival(reto: any, aprobado: boolean) {
    const uid = this.authService.currentUserId;
    if (!uid) return;
    runInInjectionContext(this.injector, async () => {
      try {
        const retoRef = doc(this.firestore, `challenges/${reto.id}`);
        if (!aprobado) {
          await updateDoc(retoRef, { estado: 'Aceptado', marcadorPropuesto: null, quienRegistroId: null });
          this.presentarToast('Marcador rechazado.', 'warning'); return;
        }
        
        const oponenteId = reto.retadorId === uid ? reto.rivalId : reto.retadorId;
        const yoGane = !reto.ganoQuienRegistro; 

        // Lógica de recompensas: Ganador +3 BTRP, Perdedor 0 BTRP. Ambos suman XP.
        const miXP = yoGane ? 150 : 50;   
        const opXP = yoGane ? 50 : 150;   
        const miPuntoRanking = yoGane ? 3 : 0; 
        const opPuntoRanking = yoGane ? 0 : 3; 

        const miRef = doc(this.firestore, `perfiles/${uid}`);
        const opRef = doc(this.firestore, `perfiles/${oponenteId}`);

        await updateDoc(miRef, {
          'stats.puntos': increment(miXP), 
          'stats.btrp': increment(miPuntoRanking), 
          'stats.partidos': increment(1), 
          'stats.victorias': yoGane ? increment(1) : increment(0),
          'stats.derrotas': !yoGane ? increment(1) : increment(0),
          'stats.streak': yoGane ? increment(1) : 0,
          'bentoUI.actividadMensual': arrayUnion(new Date().getDate()),
          'bentoUI.challengesJugados': increment(1),
          'bentoUI.historiaChallenges': arrayUnion({ 
            resultado: yoGane ? 'W' : 'L', marcador: reto.marcadorPropuesto, 
            fecha: Date.now(), oponente: oponenteId 
          })
        });

        await updateDoc(opRef, {
          'stats.puntos': increment(opXP), 
          'stats.btrp': increment(opPuntoRanking), 
          'stats.partidos': increment(1), 
          'stats.victorias': !yoGane ? increment(1) : increment(0),
          'stats.derrotas': yoGane ? increment(1) : increment(0),
          'stats.streak': !yoGane ? increment(1) : 0,
          'bentoUI.actividadMensual': arrayUnion(new Date().getDate()),
          'bentoUI.challengesJugados': increment(1),
          'bentoUI.historiaChallenges': arrayUnion({ 
            resultado: !yoGane ? 'W' : 'L', marcador: reto.marcadorPropuesto, 
            fecha: Date.now(), oponente: uid 
          })
        });

        await updateDoc(retoRef, { 
          estado: 'Finalizado', resultado: reto.marcadorPropuesto, 
          ganadorId: yoGane ? uid : oponenteId, fechaFinalizacion: serverTimestamp() 
        });
        
        const resMsg = yoGane ? `¡Victoria! +3 pts y ${miXP} XP` : `Match finalizado. +${miXP} XP`;
        this.presentarToast(resMsg, 'success');
      } catch (e) { this.presentarToast('Error crítico', 'danger'); }
    });
  }

  // ==========================================================================
  // 🛠️ HELPERS Y NAVEGACIÓN
  // ==========================================================================

  generarProximasFechas() {
    this.proximasFechas = [];
    const hoy = new Date();
    for (let i = 0; i < 8; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);
      // Guardamos la fecha en formato YYYY-MM-DD para evitar desfases horarios
      const y = fecha.getFullYear();
      const m = String(fecha.getMonth() + 1).padStart(2, '0');
      const d = String(fecha.getDate()).padStart(2, '0');
      const valorLimpio = `${y}-${m}-${d}`;
      
      const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
      let label = fecha.toLocaleDateString('es-MX', opciones);
      label = label.charAt(0).toUpperCase() + label.slice(1);
      this.proximasFechas.push({ label: i === 0 ? `Hoy (${label})` : label, valor: valorLimpio });
    }
    this.nuevoReto.fecha = this.proximasFechas[0].valor;
  }

  async eliminarMatch(id: string) {
    runInInjectionContext(this.injector, async () => {
      try {
        await deleteDoc(doc(this.firestore, `challenges/${id}`));
        this.presentarToast('Match cancelado', 'success');
      } catch (e) { this.presentarToast('Error', 'danger'); }
    });
  }

  irAResultados(reto: any) { this.retoSeleccionado = reto; this.isModalScoreOpen = true; }
  abrirModalReto() { if (!this.limiteAlcanzado) this.isModalRetoOpen = true; else this.presentarToast('Límite de retos', 'warning'); }
  activarBanner(logro: any) { if (logro.desbloqueado) { this.logros.forEach(l => l.activo = false); logro.activo = true; this.bannerTemporal = logro; } }
  
  async confirmarSeleccion() { 
    runInInjectionContext(this.injector, async () => { 
      const uid = this.authService.currentUserId; 
      if (uid && this.bannerTemporal) { 
        await this.rankingsService.updateUserData(uid, { bannerSeleccionado: this.bannerTemporal.id }); 
        this.presentarToast('Banner actualizado', 'success'); 
        this.bannerTemporal = null; 
      } 
    }); 
  }
  
  cambioSegmento(event: any) { this.segmentoActual = event.detail.value; }
  
  async presentarToast(m: string, color: string) { 
    const t = await this.toastCtrl.create({ message: m, duration: 2000, color: color, position: 'bottom', mode: 'ios' }); 
    t.present(); 
  }

  ngOnDestroy() { this.subscripcion.unsubscribe(); }
}
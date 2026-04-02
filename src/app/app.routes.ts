import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Redirección inicial al Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) 
  },

  { 
    path: 'registro', 
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage) 
  },

  {
    path: 'setup-perfil',
    loadComponent: () => import('./pages/setup-perfil/setup-perfil.page').then(m => m.SetupPerfilPage)
  },

  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then(m => m.SplashPage)
  },
  
  // 2. Estructura de Navegación por Tabs
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'tab1', // HOME
        loadComponent: () => import('./pages/tab1/tab1.page').then(m => m.Tab1Page)
      },
       {
        path: 'tab2', 
        loadComponent: () => import('./pages/tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: 'tab3', // PERFIL
        loadComponent: () => import('./pages/tab3/tab3.page').then(m => m.Tab3Page)
      },
      {
        path: 'tab4', 
        loadComponent: () => import('./pages/tab4/tab4.page').then(m => m.Tab4Page)
      },
      {
        path: 'tab5', 
        loadComponent: () => import('./pages/tab5/tab5.page').then(m => m.Tab5Page)
      },
      {
        path: '',
        redirectTo: 'tab1',
        pathMatch: 'full'
      }
    ]
  },

  // 3. Rutas Globales (Fuera de Tabs para que cubran toda la pantalla)
  {
    path: 'perfil-amigo/:id', // <--- MOVIDA AQUÍ Y CON :id
    loadComponent: () => import('./pages/perfil-amigo/perfil-amigo.page').then(m => m.PerfilAmigoPage)
  },

  {
    path: 'mis-torneos',
    loadComponent: () => import('./pages/mis-torneos/mis-torneos.page').then(m => m.MisTorneosPage)
  },

  {
    path: 'torneo-detalle/:id', 
    loadComponent: () => import('./pages/torneo-detalle/torneo-detalle.page').then(m => m.TorneoDetallePage)
  },

  {
    path: 'crear-partido',
    loadComponent: () => import('./pages/crear-partido/crear-partido.page').then(m => m.CrearPartidoPage)
  }
];
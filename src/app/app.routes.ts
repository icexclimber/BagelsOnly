import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home', // 🎾 MOVIDO AQUÍ
        loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'feed', // 🎾 MOVIDO AQUÍ
        loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage)
      },
      {
        path: 'tab1',
        loadComponent: () => import('./pages/tab1/tab1.page').then(m => m.Tab1Page)
      },
      {
        path: 'tab2',
        loadComponent: () => import('./pages/tab2/tab2.page').then(m => m.Tab2Page)
      },
      {
        path: 'tab3',
        loadComponent: () => import('./pages/tab3/tab3.page').then(m => m.Tab3Page)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },

  // Estas pueden quedarse afuera si son pantallas completas (sin tabs abajo)
  {
    path: 'torneo-detalle',
    loadComponent: () => import('./pages/torneo-detalle/torneo-detalle.page').then( m => m.TorneoDetallePage)
  },
  {
    path: 'crear-partido',
    loadComponent: () => import('./pages/crear-partido/crear-partido.page').then( m => m.CrearPartidoPage)
  },
  {
    path: 'setup-perfil',
    loadComponent: () => import('./pages/setup-perfil/setup-perfil.page').then( m => m.SetupPerfilPage)
  },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.page').then( m => m.SplashPage)
  }


];
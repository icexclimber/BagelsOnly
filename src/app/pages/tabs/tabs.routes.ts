import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../home/home.page').then(m => m.HomePage),
      },
      {
        path: 'feed',
        loadComponent: () => import('../feed/feed.page').then(m => m.FeedPage),
      },
      {
        path: 'tab1', // Perfil
        loadComponent: () => import('../tab1/tab1.page').then(m => m.Tab1Page),
      },
      {
        path: 'tab2', // Rankings
        loadComponent: () => import('../tab2/tab2.page').then(m => m.Tab2Page),
      },
      {
        path: 'tab3', // Ajustes
        loadComponent: () => import('../tab3/tab3.page').then(m => m.Tab3Page),
      },
      {
        path: '',
        redirectTo: 'home', // 👈 Importante: sin slash inicial aquí
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home', // 👈 Aquí sí lleva slash para la ruta principal
    pathMatch: 'full',
  },
];
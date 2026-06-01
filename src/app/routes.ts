import { createBrowserRouter } from 'react-router';
import Root from './components/Root';
import HomePage from './components/HomePage';
import VetrinaPage from './components/VetrinaPage';
import ProductDetailPage from './components/ProductDetailPage';
import ContattPage from './components/ContattPage';
import AdminPage from './components/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'vetrina', Component: VetrinaPage },
      { path: 'vetrina/:id', Component: ProductDetailPage },
      { path: 'contatti', Component: ContattPage },
      { path: 'admin', Component: AdminPage },
    ],
  },
]);

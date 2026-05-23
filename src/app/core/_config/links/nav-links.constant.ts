import { NavLink } from '@core/_models/links/nav-link.model';

export const HEADER_NAV_LINKS: NavLink[] = [
  // --- Publics Links ---
  {
    path: '/home',
    labelKey: 'LAYOUT.HEADER.NAV.WELCOME'
  },
  // --- Privates Links ---
  {
    path: '/private/my-plants',
    labelKey: 'LAYOUT.HEADER.NAV.PRIVATE.PLANTS',
    requiresAuth: true
  },
  {
    path: '/private/dashboard',
    labelKey: 'LAYOUT.HEADER.NAV.PRIVATE.DASHBOARD',
    requiresAuth: true
  },
  {
    path: '/private/settings',
    labelKey: 'LAYOUT.HEADER.NAV.PRIVATE.SETTINGS',
    requiresAuth: true
  },
  // --- Publics Links ---
  {
    path: '/contact',
    labelKey: 'LAYOUT.HEADER.NAV.CONTACT'
  }
];

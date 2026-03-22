import { IEnvironment } from '@core/_models/environment/environment.interface';

export const ENVIRONMENT: IEnvironment = {
  production: true,
  useMocks: false,
  apiUrl: 'https://api.your-domain.com/api',
  logLevel: 'error',
  application: {
    name: 'GrowLogic',
    author: 'Emmanuel Lefevre, Adrien Lazaille, Camille Hoareau, Rémy Nowe, Louise Delaunay, Nicolas Lombard',
    keywords: 'angular, seo, i18n, vitest, pnpm',
    themeColor: '#08b26b',
    defaultShareImage: 'https://growlogic.emmanuellefevre.com/assets/logos/logo.png'
  }
};

import { IEnvironment } from '@core/_models/environment/environment.interface';

export const ENVIRONMENT: IEnvironment = {
  production: false,
  useMocks: true,
  apiUrl: 'http://localhost:3000/api',
  logLevel: 'debug',
  application: {
    name: 'GrowLogic',
    author: 'Emmanuel Lefevre, Adrien Lazaille, Camille Hoareau, Rémy Nowe, Louise Delaunay, Nicolas Lombard',
    themeColor: '#08b26b',
    defaultShareImage: 'https://growlogic.emmanuellefevre.com/assets/logos/logo.png'
  },
  supabase: {
    url: process.env['NG_APP_SUPABASE_URL'] || '',
    anonKey: process.env['NG_APP_SUPABASE_ANON_KEY'] || ''
  }
};

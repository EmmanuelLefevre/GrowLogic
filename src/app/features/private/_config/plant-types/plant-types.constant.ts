import { PlantTypeKey } from '@features/private/_models/plant/plant.model';

export interface PlantTypeConfig {
  key: PlantTypeKey;
  labelKey: string;
}

export const PLANT_TYPES: PlantTypeConfig[] = [
  { key: 'cactus', labelKey: 'PAGES.PLANTS.TYPES.CACTUS' },
  { key: 'succulente', labelKey: 'PAGES.PLANTS.TYPES.SUCCULENTE' },
  { key: 'tropicale', labelKey: 'PAGES.PLANTS.TYPES.TROPICALE' },
  { key: 'arbre', labelKey: 'PAGES.PLANTS.TYPES.ARBRE' },
  { key: 'fleur', labelKey: 'PAGES.PLANTS.TYPES.FLEUR' },
  { key: 'herbe', labelKey: 'PAGES.PLANTS.TYPES.HERBE' },
  { key: 'fougere', labelKey: 'PAGES.PLANTS.TYPES.FOUGERE' },
  { key: 'aquatique', labelKey: 'PAGES.PLANTS.TYPES.AQUATIQUE' },
  { key: 'grimpante', labelKey: 'PAGES.PLANTS.TYPES.GRIMPANTE' },
  { key: 'bonsai', labelKey: 'PAGES.PLANTS.TYPES.BONSAI' },
  { key: 'autre', labelKey: 'PAGES.PLANTS.TYPES.AUTRE' },
];

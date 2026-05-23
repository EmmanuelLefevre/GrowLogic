import { PlantMoodKey } from '@app/features/private/_models/plant/plant.model';

export interface PlantMoodConfig {
  key: PlantMoodKey;
  labelKey: string;
}

export const PLANT_MOODS: PlantMoodConfig[] = [
  { key: 'happy', labelKey: 'PAGES.PLANTS.MOODS.HAPPY' },
  { key: 'thriving', labelKey: 'PAGES.PLANTS.MOODS.THRIVING' },
  { key: 'growing', labelKey: 'PAGES.PLANTS.MOODS.GROWING' },
  { key: 'radiant', labelKey: 'PAGES.PLANTS.MOODS.RADIANT' },
  { key: 'sleepy', labelKey: 'PAGES.PLANTS.MOODS.SLEEPY' },
  { key: 'lazy', labelKey: 'PAGES.PLANTS.MOODS.LAZY' },
  { key: 'moody', labelKey: 'PAGES.PLANTS.MOODS.MOODY' },
  { key: 'grumpy', labelKey: 'PAGES.PLANTS.MOODS.GRUMPY' },
  { key: 'sad', labelKey: 'PAGES.PLANTS.MOODS.SAD' },
  { key: 'sick', labelKey: 'PAGES.PLANTS.MOODS.SICK' },
];

export type PlantMoodKey =
  | 'happy'
  | 'sad'
  | 'grumpy'
  | 'lazy'
  | 'growing'
  | 'thriving'
  | 'sick'
  | 'moody'
  | 'radiant'
  | 'sleepy';

export interface Plant {
  IdPlant: string;
  IdUser: string;
  name: string;
  mood: PlantMoodKey | null;
  AiContext: Record<string, unknown> | null;
  createdAt: string;
  changedAt: string;
}

export type PlantCreate = Pick<Plant, 'name' | 'mood' | 'IdUser'>;

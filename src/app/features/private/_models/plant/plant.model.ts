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
  id: string;
  idUser: string;
  name: string;
  mood: PlantMoodKey | null;
  aiContext: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type PlantCreate = Pick<Plant, 'name' | 'mood' | 'idUser'>;

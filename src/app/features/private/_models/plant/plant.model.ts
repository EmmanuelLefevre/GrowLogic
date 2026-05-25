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

export type PlantTypeKey =
  | 'cactus'
  | 'succulente'
  | 'tropicale'
  | 'arbre'
  | 'fleur'
  | 'herbe'
  | 'fougere'
  | 'aquatique'
  | 'grimpante'
  | 'bonsai'
  | 'autre';

export interface Plant {
  id: string;
  idUser: string;
  name: string;
  typePlant: PlantTypeKey;
  mood: PlantMoodKey | null;
  aiContext: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type PlantCreate = Pick<Plant, 'name' | 'typePlant' | 'mood' | 'idUser'>;

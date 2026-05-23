import { Answer } from '../answer/answer.model';

export interface Question {
  id: string;
  content: string;
  idPlant: string;
  idUser: string;
  answer: Answer | null;
  createdAt: string;
  updatedAt: string;
}

export type QuestionCreate = Pick<Question, 'content' | 'idPlant' | 'idUser'>;

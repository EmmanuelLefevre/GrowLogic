export interface Answer {
  IdAnswer: string;
  createdAt: string;
  answer: string;
  IdQuestion: string;
  IdUser: string;
}

export interface Question {
  IdQuestion: string;
  createdAt: string;
  question: string;
  IdPlant: string;
  IdUser: string;
  answer: Answer | null;
}

export type QuestionCreate = Pick<Question, 'question' | 'IdPlant' | 'IdUser'>;

import { CheckAnswerSchema } from '@/api/game/game-list/quiz/schema';

export interface UnjumblePuzzle {
  id: string;
  jumbled: string;
  question?: string;
}

export interface UnjumbleCheckAnswerRequest {
  questionId: string;
  answer: string;
}

export interface UnjumbleCheckAnswerResponse {
  correct: boolean;
  score: number;
  status: boolean;
  message: string;
}

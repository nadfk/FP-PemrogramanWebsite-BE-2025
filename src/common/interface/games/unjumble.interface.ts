import { CheckAnswerSchema } from '@/api/game/game-list/quiz/schema';

export interface UnjumblePuzzle {
  id: number;
  jumbled: string;
  difficulty: string;
}

export interface UnjumbleCheckAnswerRequest {
  questionId: number;
  answer: string;
}

export interface UnjumbleCheckAnswerResponse {
  correct: boolean;
  score: number;
  status: boolean;
  message: string;
}

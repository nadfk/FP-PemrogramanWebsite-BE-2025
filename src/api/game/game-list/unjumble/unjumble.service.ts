import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import {
  type UnjumbleCheckAnswerRequest,
  type UnjumbleCheckAnswerResponse,
  type UnjumblePuzzle,
} from '@/common/interface/games/unjumble.interface';

import { shuffleWord } from './utils/shuffle.util';

export class UnjumbleService {
  async getPuzzle(): Promise<UnjumblePuzzle> {
    const data = await prisma.wordList.findFirst({
      where: { gameSlug: 'unjumble' },
      orderBy: { createdAt: 'asc' },
    });

    if (!data) throw new Error('Puzzle not found');

    return {
      id: data.id,
      jumbled: shuffleWord(data.word),
      difficulty: data.difficulty,
    };
  }

  async checkAnswer(
    body: UnjumbleCheckAnswerRequest,
  ): Promise<UnjumbleCheckAnswerResponse> {
    const real = await prisma.wordList.findUnique({
      where: { id: body.questionId },
    });

    if (!real) throw new Error('Question not found');

    const correct = real.word.toLowerCase() === body.answer.toLowerCase();

    return {
      status: true,
      correct,
      message: correct ? 'Correct Answer' : 'Wrong Answer',
      score: correct ? 10 : 0,
    };
  }

  async addPlayCount(): Promise<void> {
    await prisma.game.update({
      where: { slug: 'unjumble' },
      data: { playCount: { increment: 1 } },
    });
  }
}

export const unjumbleService = new UnjumbleService();

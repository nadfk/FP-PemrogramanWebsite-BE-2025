import { type Prisma } from '@prisma/client';
import {
  type UnjumbleCheckAnswerRequest,
  type UnjumbleCheckAnswerResponse,
  type UnjumblePuzzle,
} from '@/common/interface/games/unjumble.interface';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';
import { ErrorResponse, prisma } from '@/common';
import { FileManager } from '@/utils';

import { shuffleWord } from './utils/shuffle.util';
import { type ICreateUnjumble } from './schema';

interface IUnjumbleJson {
  score_per_sentence: number;
  is_randomized: boolean;
  sentences: Array<{
    sentence_text: string;
    sentence_image: string | null;
  }>;
}

export class UnjumbleService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static UNJUMBLE_SLUG = 'unjumble';

  static async createUnjumble(data: ICreateUnjumble, user_id: string) {
    await UnjumbleService.existGameCheck(data.name);

    const newUnjumbleId = v4();
    const unjumbleTemplateId = await UnjumbleService.getGameTemplateId();

    const thumbnailImagePath = await FileManager.upload(
      `game/unjumble/${newUnjumbleId}`,
      data.thumbnail_image,
    );

    const imageArray: string[] = [];

    if (data.files_to_upload) {
      for (const image of data.files_to_upload) {
        const newImagePath = await FileManager.upload(
          `game/unjumble/${newUnjumbleId}`,
          image,
        );
        imageArray.push(newImagePath);
      }
    }

    const unjumbleJson: IUnjumbleJson = {
      score_per_sentence: data.score_per_sentence,
      is_randomized: data.is_randomized ?? false,
      sentences: data.sentences.map((sentence) => ({
        sentence_text: sentence.sentence_text,
        sentence_image:
          typeof sentence.sentence_image_array_index === 'number'
            ? imageArray[sentence.sentence_image_array_index]
            : null,
      })),
    };

    const newGame = await prisma.games.create({
      data: {
        id: newUnjumbleId,
        game_template_id: unjumbleTemplateId,
        creator_id: user_id,
        name: data.name,
        description: data.description,
        thumbnail_image: thumbnailImagePath,
        is_published: data.is_publish_immediately,
        game_json: unjumbleJson as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
      },
    });

    return newGame;
  }

  static async getUnjumblePlay(game_id: string, is_public: boolean) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail_image: true,
        is_published: true,
        game_json: true,
        game_template: {
          select: { slug: true },
        },
      },
    });

    if (
      !game ||
      (is_public && !game.is_published) ||
      game.game_template.slug !== UnjumbleService.UNJUMBLE_SLUG
    )
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    const unjumbleJson = game.game_json as unknown as IUnjumbleJson | null;

    if (!unjumbleJson)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Unjumble data not found');

    return {
      id: game.id,
      name: game.name,
      description: game.description,
      thumbnail_image: game.thumbnail_image,
      score_per_sentence: unjumbleJson.score_per_sentence,
      is_randomized: unjumbleJson.is_randomized,
      sentences: unjumbleJson.sentences,
      is_published: game.is_published,
    };
  }

  private static async existGameCheck(game_name?: string, game_id?: string) {
    const where: Record<string, unknown> = {};
    if (game_name) where.name = game_name;
    if (game_id) where.id = game_id;

    if (Object.keys(where).length === 0) return null;

    const game = await prisma.games.findFirst({
      where,
      select: { id: true, creator_id: true },
    });

    if (game)
      throw new ErrorResponse(
        StatusCodes.BAD_REQUEST,
        'Game name already exists',
      );

    return game;
  }

  private static async getGameTemplateId() {
    const result = await prisma.gameTemplates.findUnique({
      where: { slug: UnjumbleService.UNJUMBLE_SLUG },
      select: { id: true },
    });

    if (!result)
      throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game template not found');

    return result.id;
  }

  static async deleteUnjumble(
    game_id: string,
    user_id: string,
    user_role: string,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: { creator_id: true },
    });

    if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    if (user_role !== 'SUPER_ADMIN' && game.creator_id !== user_id)
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User not allowed to delete this data',
      );

    // Delete from DB first to ensure persistence consistency
    const deletedGame = await prisma.games.delete({
      where: { id: game_id },
    });

    // Try to delete associated files, but don't block if it fails (e.g. file locks)
    try {
      await FileManager.deleteFolder(`game/unjumble/${game_id}`);
    } catch (error) {
      console.error(`Failed to delete folder for game ${game_id}:`, error);
    }

    return deletedGame;
  }

  static async updateUnjumble(
    game_id: string,
    data: any, // using any for now to avoid deep import issues, but preferably IUpdateUnjumble
    user_id: string,
    user_role: string,
  ) {
    const game = await prisma.games.findUnique({
      where: { id: game_id },
      select: { creator_id: true, game_json: true, thumbnail_image: true },
    });

    if (!game) throw new ErrorResponse(StatusCodes.NOT_FOUND, 'Game not found');

    if (user_role !== 'SUPER_ADMIN' && game.creator_id !== user_id)
      throw new ErrorResponse(
        StatusCodes.FORBIDDEN,
        'User not allowed to edit this data',
      );

    let thumbnailImagePath = game.thumbnail_image;
    if (data.thumbnail_image) {
      thumbnailImagePath = await FileManager.upload(
        `game/unjumble/${game_id}`,
        data.thumbnail_image,
      );
    }

    const imageArray: string[] = [];

    if (data.files_to_upload) {
      for (const image of data.files_to_upload) {
        const newImagePath = await FileManager.upload(
          `game/unjumble/${game_id}`,
          image,
        );
        imageArray.push(newImagePath);
      }
    }

    const currentJson = game.game_json as unknown as IUnjumbleJson;
    const newJson: IUnjumbleJson = {
      score_per_sentence: data.score_per_sentence ?? currentJson.score_per_sentence,
      is_randomized: data.is_randomized ?? currentJson.is_randomized,
      sentences: data.sentences ? data.sentences.map((sentence: any) => {
        let sentenceImage: string | null = null;
        if (typeof sentence.sentence_image_array_index === 'number') {
          sentenceImage = imageArray[sentence.sentence_image_array_index];
        } else if (typeof sentence.sentence_image_array_index === 'string') {
          sentenceImage = sentence.sentence_image_array_index;
        }
        return {
          sentence_text: sentence.sentence_text,
          sentence_image: sentenceImage,
        };
      }) : currentJson.sentences,
    };

    const updateData: any = {
      game_json: newJson as unknown as Prisma.InputJsonValue,
    };

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.thumbnail_image) updateData.thumbnail_image = thumbnailImagePath;
    if (data.is_publish_immediately !== undefined) updateData.is_published = data.is_publish_immediately;

    return await prisma.games.update({
      where: { id: game_id },
      data: updateData,
    });
  }

  async getPuzzle(): Promise<UnjumblePuzzle> {
    const data = await prisma.unjumble.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!data) throw new Error('Puzzle not found');

    return {
      id: data.id,
      jumbled: shuffleWord(data.answer),
      question: data.question ?? undefined,
    };
  }

  async checkAnswer(
    body: UnjumbleCheckAnswerRequest,
  ): Promise<UnjumbleCheckAnswerResponse> {
    // Note: This needs to be implemented against the Game logic not the legacy 'Unjumble' table
    // For now keeping as is if it's being used by legacy code, but it seems to refer to 'prisma.unjumble' which I don't see in context. 
    // Assuming legacy support.

    const real = await prisma.unjumble.findUnique({
      where: { id: body.questionId },
    });

    if (!real) throw new Error('Question not found');

    const correct = real.answer.toLowerCase() === body.answer.toLowerCase();

    return {
      status: true,
      correct,
      message: correct ? 'Correct Answer' : 'Wrong Answer',
      score: correct ? 10 : 0,
    };
  }

  async addPlayCount(): Promise<void> {
    // Try to increment play counter on Games table if exists and matches name 'Unjumble'
    try {
      await prisma.games.updateMany({
        where: { name: 'Unjumble' },
        data: { total_played: { increment: 1 } },
      });
    } catch (err) {
      // ignore if Games model doesn't match or update fails
    }
  }
}

export const unjumbleService = new UnjumbleService();
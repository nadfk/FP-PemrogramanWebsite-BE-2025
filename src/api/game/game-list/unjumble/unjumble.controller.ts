import { type NextFunction, type Request, type Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import {
  type AuthedRequest,
  SuccessResponse,
  validateAuth,
  validateBody,
} from '@/common';

import { UnjumbleService, unjumbleService } from './unjumble.service';
import {
  CreateUnjumbleSchema,
  type ICreateUnjumble,
  UpdateUnjumbleSchema,
  type IUpdateUnjumble,
} from './schema';
import { GameService } from '@/api/game/game.service';
import { UpdatePublishStatusSchema, type IUpdatePublishStatus } from '@/api/game/schema';

export const UnjumbleController = Router()
  .post(
    '/',
    validateAuth({}),
    validateBody({
      schema: CreateUnjumbleSchema,
      file_fields: [
        { name: 'thumbnail_image', maxCount: 1 },
      ],
    }),
    async (
      request: AuthedRequest<{}, {}, ICreateUnjumble>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const newGame = await UnjumbleService.createUnjumble(
          request.body,
          request.user!.user_id,
        );
        const result = new SuccessResponse(
          StatusCodes.CREATED,
          'Unjumble game created',
          newGame,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        next(error);
      }
    },
  )
  .get(
    '/:game_id/play/public',
    async (
      request: Request<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await UnjumbleService.getUnjumblePlay(
          request.params.game_id,
          true,
        );
        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get public game successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .patch(
    '/:game_id',
    validateAuth({}),
    validateBody({
      schema: UpdatePublishStatusSchema,
    }),
    async (
      request: AuthedRequest<{ game_id: string }, {}, IUpdatePublishStatus>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await GameService.updateGamePublishStatus(
          { ...request.body, game_id: request.params.game_id },
          request.user!.user_id,
          request.user!.role,
        );

        const responseResult = new SuccessResponse(
          StatusCodes.OK,
          'Update publish status successfully',
          result,
        );

        return response.status(responseResult.statusCode).json(responseResult.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .put(
    '/:game_id',
    validateAuth({}),
    validateBody({
      schema: UpdateUnjumbleSchema,
      file_fields: [{ name: 'thumbnail_image', maxCount: 1 }],
    }),
    async (
      request: AuthedRequest<{ game_id: string }, {}, IUpdateUnjumble>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await UnjumbleService.updateUnjumble(
          request.params.game_id,
          request.body,
          request.user!.user_id,
          request.user!.role,
        );

        const responseResult = new SuccessResponse(
          StatusCodes.OK,
          'Update game successfully',
          result,
        );

        return response.status(responseResult.statusCode).json(responseResult.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .get(
    '/:game_id/edit',
    validateAuth({}),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const game = await UnjumbleService.getUnjumbleById(
          request.params.game_id,
          request.user!.user_id,
        );

        const result = new SuccessResponse(
          StatusCodes.OK,
          'Get game data for edit successfully',
          game,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  )
  .delete(
    '/:game_id',
    validateAuth({}),
    async (
      request: AuthedRequest<{ game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        await UnjumbleService.deleteUnjumble(
          request.params.game_id,
          request.user!.user_id,
          request.user!.role,
        );

        const result = new SuccessResponse(
          StatusCodes.OK,
          'Delete game successfully',
          null,
        );

        return response.status(result.statusCode).json(result.json());
      } catch (error) {
        return next(error);
      }
    },
  );

export class UnjumbleControllerClass {
  async getPuzzle(request: Request, res: Response) {
    try {
      const data = await unjumbleService.getPuzzle();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async checkAnswer(request: Request, res: Response) {
    try {
      const result = await unjumbleService.checkAnswer(request.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addPlayCount(request: Request, res: Response) {
    try {
      await unjumbleService.addPlayCount();
      res.json({
        status: true,
        message: 'Play count added',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const unjumbleController = new UnjumbleControllerClass();

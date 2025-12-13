/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-default-export */
import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';
import { StatusCodes } from 'http-status-codes';

import { GameService } from '@/api/game/game.service';
import { type ICheckAnswer } from '@/api/game/game-list/quiz/schema';
import {
  type IUpdatePublishStatus,
  UpdatePublishStatusSchema,
} from '@/api/game/schema';
import {
  type AuthedRequest,
  SuccessResponse,
  validateAuth,
  validateBody,
} from '@/common';

import {
  CreateUnjumbleSchema,
  type ICreateUnjumble,
  type IUpdateUnjumble,
  UpdateUnjumbleSchema,
} from './schema';
import { UnjumbleService, unjumbleService } from './unjumble.service';

export const UnjumbleController = Router()
  // ------------------------------- //
  // ADMIN AREA
  // ------------------------------- //

  .post(
    '/',
    validateAuth({}),
    validateBody({
      schema: CreateUnjumbleSchema,
      file_fields: [{ name: 'thumbnail_image', maxCount: 1 }],
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

        return response
          .status(StatusCodes.CREATED)
          .json(
            new SuccessResponse(
              StatusCodes.CREATED,
              'Unjumble game created',
              newGame,
            ).json(),
          );
      } catch (error) {
        next(error);
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
        const updated = await UnjumbleService.updateUnjumble(
          request.params.game_id,
          request.body,
          request.user!.user_id,
          request.user!.role,
        );

        return response
          .status(StatusCodes.OK)
          .json(
            new SuccessResponse(
              StatusCodes.OK,
              'Update game successfully',
              updated,
            ).json(),
          );
      } catch (error) {
        next(error);
      }
    },
  )

  .patch(
    '/:game_id',
    validateAuth({}),
    validateBody({ schema: UpdatePublishStatusSchema }),
    async (
      request: AuthedRequest<{ game_id: string }, {}, IUpdatePublishStatus>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const updated = await GameService.updateGamePublishStatus(
          { ...request.body, game_id: request.params.game_id },
          request.user!.user_id,
          request.user!.role,
        );

        return response
          .status(StatusCodes.OK)
          .json(
            new SuccessResponse(
              StatusCodes.OK,
              'Update publish status successfully',
              updated,
            ).json(),
          );
      } catch (error) {
        next(error);
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

        return response
          .status(StatusCodes.OK)
          .json(
            new SuccessResponse(
              StatusCodes.OK,
              'Delete game successfully',
              null,
            ).json(),
          );
      } catch (error) {
        next(error);
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

        return response
          .status(StatusCodes.OK)
          .json(
            new SuccessResponse(
              StatusCodes.OK,
              'Get game data for edit successfully',
              game,
            ).json(),
          );
      } catch (error) {
        next(error);
      }
    },
  )

  // ------------------------------- //
  // PLAYER AREA
  // ------------------------------- //

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

        return response
          .status(StatusCodes.OK)
          .json(
            new SuccessResponse(
              StatusCodes.OK,
              'Game retrieved successfully',
              game,
            ).json(),
          );
      } catch (error) {
        next(error);
      }
    },
  )

  .get('/play/:game_id', async (request, response, next) => {
    try {
      const game = await UnjumbleService.getUnjumblePlay(
        request.params.game_id,
        true,
      );

      return response
        .status(StatusCodes.OK)
        .json(
          new SuccessResponse(
            StatusCodes.OK,
            'Game retrieved successfully',
            game,
          ).json(),
        );
    } catch (error) {
      next(error);
    }
  })

  .get('/:game_id', async (request, response, next) => {
    try {
      const game = await UnjumbleService.getUnjumblePlay(
        request.params.game_id,
        true,
      );

      return response
        .status(StatusCodes.OK)
        .json(
          new SuccessResponse(
            StatusCodes.OK,
            'Get unjumble game successfully',
            game,
          ).json(),
        );
    } catch (error) {
      next(error);
    }
  })

  .post(
    '/check-answer',
    async (
      request: Request<{}, {}, ICheckAnswer>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const result = await unjumbleService.checkAnswer(request.body);

        return response.status(StatusCodes.OK).json(result);
      } catch (error) {
        next(error);
      }
    },
  )

  .post(
    '/play-count',
    validateAuth({ optional: true }),
    async (
      request: AuthedRequest<{}, {}, { game_id: string }>,
      response: Response,
      next: NextFunction,
    ) => {
      try {
        const { game_id } = request.body;
        await GameService.updateGamePlayCount(game_id, request.user?.user_id);

        return response
          .status(StatusCodes.OK)
          .json(
            new SuccessResponse(
              StatusCodes.OK,
              'Game play count updated',
              null,
            ).json(),
          );
      } catch (error) {
        next(error);
      }
    },
  );

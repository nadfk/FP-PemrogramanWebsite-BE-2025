import { Router } from 'express';

import { QuizController } from './quiz/quiz.controller';
import { UnjumbleController } from './unjumble/unjumble.controller';
import unjumbleRouter from './unjumble/unjumble.route';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/unjumble', UnjumbleController);
GameListRouter.use('/unjumble-play', unjumbleRouter);

export default GameListRouter;

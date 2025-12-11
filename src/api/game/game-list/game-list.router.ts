import { Router } from 'express';

import { AnagramController } from './anagram/anagram.controller';
import { PairOrNoPairController } from './pair-or-no-pair/pair-or-no-pair.controller';
import { QuizController } from './quiz/quiz.controller';
import { SpeedSortingController } from './speed-sorting/speed-sorting.controller';
import { TypeSpeedController } from './type-speed/type-speed.controller';
import { UnjumbleController } from './unjumble/unjumble.controller';
import unjumbleRouter from './unjumble/unjumble.route';

const GameListRouter = Router();

GameListRouter.use('/quiz', QuizController);
GameListRouter.use('/speed-sorting', SpeedSortingController);
GameListRouter.use('/anagram', AnagramController);
GameListRouter.use('/pair-or-no-pair', PairOrNoPairController);
GameListRouter.use('/type-speed', TypeSpeedController);
GameListRouter.use('/unjumble', UnjumbleController);
GameListRouter.use('/unjumble-play', unjumbleRouter);

export default GameListRouter;

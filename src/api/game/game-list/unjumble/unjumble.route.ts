import { Router } from 'express';

import { unjumbleController } from './unjumble.controller';

const router = Router();

router.get('/', unjumbleController.getPuzzle.bind(unjumbleController));
router.post(
  '/check-answer',
  unjumbleController.checkAnswer.bind(unjumbleController),
);
router.post(
  '/play-count',
  unjumbleController.addPlayCount.bind(unjumbleController),
);

export default router;

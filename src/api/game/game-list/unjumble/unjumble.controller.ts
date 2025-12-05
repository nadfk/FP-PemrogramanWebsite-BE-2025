import { type Request, type Response } from 'express';

import { UnjumbleService, unjumbleService } from './unjumble.service';

export class UnjumbleController {
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

export const unjumbleController = new UnjumbleController();

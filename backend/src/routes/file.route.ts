import { Router, Request, Response } from 'express';
import {SettingsDao} from "../daos/settings.dao";
import {DivisionDao} from "../daos/division.dao";

const router = Router();

router.get('/startercode/:division', async (req: Request, res: Response) => {
  const settings = await SettingsDao.getSettings();
  const division = await DivisionDao.getDivision(req.params.division);

  const starterCode = division.starterCode.find(sc => sc.state === settings.state);

  if (starterCode) {
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=startercode.zip');
    res.set('Content-Length', (starterCode.file as Buffer).length.toString());
    res.end(starterCode.file, 'binary');
  }

  else {
    res.sendStatus(404);
  }
});

export default router

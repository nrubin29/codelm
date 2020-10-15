import { Request, Response, Router } from 'express';
import { SettingsDao } from '../daos/settings.dao';
import { DivisionDao } from '../daos/division.dao';

const router = Router();

router.get('/startercode/:division', async (req: Request, res: Response) => {
  const settings = await SettingsDao.getSettings();
  const division = await DivisionDao.getDivision(req.params.division);
  const starterCode = division.starterCode.find(
    sc => sc.state === settings.state
  );

  if (starterCode) {
    res.redirect(`/files/startercode/${starterCode.file}.zip`);
  } else {
    res.sendStatus(404);
  }
});

export default router;

import { Request, Response, Router } from 'express';
import { SettingsDao } from '../daos/settings.dao';
import { AuthUtil } from '../auth.util';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await SettingsDao.getSettings());
});

router.put(
  '/',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    res.json(await SettingsDao.updateSettings(req.body));
  }
);

router.delete(
  '/',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    await SettingsDao.resetSettings();
    res.json(true);
  }
);

export default router;

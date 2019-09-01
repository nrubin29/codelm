import { Request, Response, Router } from 'express';
import { SettingsDao } from '../daos/settings.dao';
import { PermissionsUtil } from '../permissions.util';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await SettingsDao.getSettings());
});

router.put('/', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  res.json(await SettingsDao.updateSettings(req.body));
});

router.delete('/', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  await SettingsDao.resetSettings();
  res.json(true);
});

export default router;

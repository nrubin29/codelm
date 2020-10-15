import { Request, Response, Router } from 'express';
import { AlertDao } from '../daos/alert.dao';
import { PermissionsUtil } from '../permissions.util';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await AlertDao.getAlerts());
});

router.put(
  '/',
  PermissionsUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    res.json(await AlertDao.addOrUpdateAlert(req.body));
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    await AlertDao.deleteAlert(req.params.id);
    res.json(true);
  }
);

export default router;

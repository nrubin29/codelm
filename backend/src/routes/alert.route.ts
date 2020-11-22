import { Request, Response, Router } from 'express';
import { AlertDao } from '../daos/alert.dao';
import { AuthUtil } from '../auth.util';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await AlertDao.getAlerts());
});

router.put(
  '/',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    res.json(await AlertDao.addOrUpdateAlert(req.body));
  }
);

router.delete(
  '/:id',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    await AlertDao.deleteAlert(req.params.id);
    res.json(true);
  }
);

export default router;

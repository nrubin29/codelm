import { Request, Response, Router } from 'express';
import { AdminDao } from '../daos/admin.dao';
import { AuthUtil } from '../auth.util';

const router = Router();

router.get('/', AuthUtil.requireAdmin, (req: Request, res: Response) => {
  res.json(req.params.admin);
});

router.get(
  '/all',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    res.json(await AdminDao.getAdmins());
  }
);

router.put(
  '/',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    res.json(await AdminDao.addOrUpdateAdmin(req.body));
  }
);

router.delete(
  '/:id',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    await AdminDao.deleteAdmin(req.params.id);
    res.json(true);
  }
);

export default router;

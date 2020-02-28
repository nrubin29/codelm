import { Router, Request, Response } from 'express';
import { AdminDao } from '../daos/admin.dao';
import { PermissionsUtil } from '../permissions.util';

const router = Router();

router.get('/', PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  res.json(await AdminDao.getAdmins());
});

router.put('/', PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  res.json(await AdminDao.addOrUpdateAdmin(req.body));
});

router.delete('/:id', PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  await AdminDao.deleteAdmin(req.params.id);
  res.json(true);
});

export default router

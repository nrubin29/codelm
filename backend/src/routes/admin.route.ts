import { Router, Request, Response } from 'express';
import { AdminDao } from '../daos/admin.dao';
import { PermissionsUtil } from '../permissions.util';

const router = Router();

router.get('/', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  res.json(await AdminDao.getAdmins());
});

router.put('/', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  res.json(await AdminDao.addOrUpdateAdmin(req.body));
});

router.delete('/:id', PermissionsUtil.requireAdmin, PermissionsUtil.requireSuperUser, async (req: Request, res: Response) => {
  await AdminDao.deleteAdmin(req.params.id);
  res.json(true);
});

export default router
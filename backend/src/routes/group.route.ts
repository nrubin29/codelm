import { Router, Request, Response } from 'express';
import { PermissionsUtil } from '../permissions.util';
import {GroupDao} from '../daos/group.dao';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await GroupDao.getGroups());
});

router.put('/', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await GroupDao.addOrUpdateGroup(req.body));
});

router.delete('/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  await GroupDao.deleteGroup(req.params.id);
  res.json(true);
});

export default router;

import { Router, Request, Response } from 'express';
import { PermissionsUtil } from '../permissions.util';
import { GroupDao } from '../daos/group.dao';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await GroupDao.getAll());
});

router.put(
  '/',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await GroupDao.addOrUpdate(req.body));
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await GroupDao.deleteById(req.params.id);
    res.json(true);
  }
);

export default router;

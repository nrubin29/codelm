import { Router, Request, Response } from 'express';
import { PermissionsUtil } from '../permissions.util';
import { PersonDao } from '../daos/person.dao';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await PersonDao.getAll());
});

router.get('/group/:groupId', async (req: Request, res: Response) => {
  res.json(await PersonDao.getAllByField('group', req.params.groupId));
});

router.put(
  '/',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await PersonDao.addOrUpdate(req.body));
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await PersonDao.deleteById(req.params.id);
    res.json(true);
  }
);

export default router;

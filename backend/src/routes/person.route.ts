import { Router, Request, Response } from 'express';
import { PermissionsUtil } from '../permissions.util';
import { PersonDao } from '../daos/person.dao';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.json(await PersonDao.getPeople());
});

router.get('/group/:groupId', async (req: Request, res: Response) => {
  res.json(await PersonDao.getPeopleForGroup(req.params.groupId));
});

router.put(
  '/',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await PersonDao.addOrUpdatePerson(req.body));
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await PersonDao.deletePerson(req.params.id);
    res.json(true);
  }
);

export default router;

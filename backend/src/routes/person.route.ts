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

router.put('/', async (req: Request, res: Response) => {
  try {
    res.json(await PersonDao.addOrUpdatePerson(req.body));
  } catch {
    // TODO: Standardize, type, and properly handle errors.
    res.json({ error: 'This email address is already registered.' });
  }
});

router.delete(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await PersonDao.deletePerson(req.params.id);
    res.json(true);
  }
);

export default router;

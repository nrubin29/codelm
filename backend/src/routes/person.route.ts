import { Request, Response, Router } from 'express';
import { PermissionsUtil } from '../permissions.util';
import { PersonDao, sanitizePerson } from '../daos/person.dao';

const router = Router();

router.get(
  '/',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await PersonDao.getPeople());
  }
);

router.get(
  '/group/:groupId',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await PersonDao.getPeopleForGroup(req.params.groupId));
  }
);

router.put('/', async (req: Request, res: Response) => {
  try {
    res.json(sanitizePerson(await PersonDao.addOrUpdatePerson(req.body)));
  } catch {
    // TODO: Standardize, type, and properly handle errors.
    res.json({
      error: 'This email address or username is already registered.',
    });
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

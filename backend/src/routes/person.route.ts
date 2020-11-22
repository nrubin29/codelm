import { Request, Response, Router } from 'express';
import { AuthUtil } from '../auth.util';
import { PersonDao, sanitizePerson } from '../daos/person.dao';

const router = Router();

router.get('/', AuthUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await PersonDao.getPeople());
});

router.get(
  '/group/:groupId',
  AuthUtil.requireAdmin,
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
  AuthUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await PersonDao.deletePerson(req.params.id);
    res.json(true);
  }
);

export default router;

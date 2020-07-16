import { Router, Request, Response } from 'express';
import { sanitizeTeam, TeamDao } from '../daos/team.dao';
import { PermissionsUtil } from '../permissions.util';

const router = Router();

router.get('/', PermissionsUtil.requireTeam, (req: Request, res: Response) => {
  res.json(sanitizeTeam(req.params.team));
});

router.get(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await TeamDao.getById(req.params.id));
  }
);

router.put(
  '/',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await TeamDao.addOrUpdate(req.body));
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await TeamDao.deleteById(req.params.id);
    res.json(true);
  }
);

router.get(
  '/division/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await TeamDao.getAllByField('division', req.params.id));
  }
);

export default router;

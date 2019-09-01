import { Router, Request, Response } from 'express';
import { sanitizeTeam, TeamDao } from '../daos/team.dao';
import { PermissionsUtil } from '../permissions.util';

const router = Router();

router.get('/', PermissionsUtil.requireTeam, (req: Request, res: Response) => {
  res.json(sanitizeTeam(req.params.team));
});

router.get('/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await TeamDao.getTeam(req.params.id));
});

router.put('/', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await TeamDao.addOrUpdateTeam(req.body));
});

router.delete('/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  await TeamDao.deleteTeam(req.params.id);
  res.json(true);
});

router.get('/division/:id', PermissionsUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await TeamDao.getTeamsForDivision(req.params.id));
});

export default router
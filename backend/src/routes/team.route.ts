import { Request, Response, Router } from 'express';
import { TeamDao } from '../daos/team.dao';
import { AuthUtil } from '../auth.util';

const router = Router();

router.get('/', AuthUtil.requireTeam, (req: Request, res: Response) => {
  res.json(req.params.team);
});

router.get(
  '/:id',
  AuthUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await TeamDao.getTeam(req.params.id));
  }
);

router.put('/', AuthUtil.requireAdmin, async (req: Request, res: Response) => {
  res.json(await TeamDao.addOrUpdateTeam(req.body));
});

router.delete(
  '/:id',
  AuthUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await TeamDao.deleteTeam(req.params.id);
    res.json(true);
  }
);

router.get(
  '/division/:id',
  AuthUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await TeamDao.getTeamsForDivision(req.params.id));
  }
);

export default router;

import { Request, Response, Router } from 'express';
import { DivisionDao } from '../daos/division.dao';
import {
  DivisionModel,
  DivisionType,
} from '@codelm/common/src/models/division.model';
import { AuthUtil } from '../auth.util';

const router = Router();

// This endpoint returns Competition divisions for non-admins to support the
// possibility of Group sponsor accounts. If this feature isn't implemented,
// this endpoint can be locked down to just admins.
router.get('/', AuthUtil.requestAuth, async (req: Request, res: Response) => {
  let divisions: DivisionModel[];

  if (req.params.admin) {
    divisions = await DivisionDao.getDivisions();
  } else {
    divisions = await DivisionDao.getDivisionsOfType(DivisionType.Competition);
  }

  res.json(divisions);
});

router.put(
  '/',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    res.json(await DivisionDao.addOrUpdateDivision(req.body));
  }
);

router.delete(
  '/:id',
  AuthUtil.requireSuperUser,
  async (req: Request, res: Response) => {
    await DivisionDao.deleteDivision(req.params.id);
    res.json(true);
  }
);

export default router;

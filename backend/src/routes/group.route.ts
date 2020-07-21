import { Router, Request, Response } from 'express';
import { PermissionsUtil } from '../permissions.util';
import { GroupDao } from '../daos/group.dao';
import { GroupModel } from '../../../common/src/models/group.model';

const router = Router();

router.get(
  '/',
  PermissionsUtil.requestAdmin,
  async (req: Request, res: Response) => {
    let groups: GroupModel[];

    if (req.params.admin) {
      groups = await GroupDao.getGroups();
    } else {
      groups = await GroupDao.getNonSpecialGroups();
    }

    res.json(groups);
  }
);

router.put(
  '/',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    res.json(await GroupDao.addOrUpdateGroup(req.body));
  }
);

router.delete(
  '/:id',
  PermissionsUtil.requireAdmin,
  async (req: Request, res: Response) => {
    await GroupDao.deleteGroup(req.params.id);
    res.json(true);
  }
);

export default router;

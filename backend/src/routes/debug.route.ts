import { Request, Response, Router } from 'express';
import { TeamDao } from '../daos/team.dao';
import { DivisionDao } from '../daos/division.dao';
import { DivisionType } from '../../../common/src/models/division.model';
import { PermissionsUtil } from '../permissions.util';

let debugTeamUsernames: readonly string[];

const router = Router();

router.use(PermissionsUtil.requireDebugMode);

router.get('/', (req: Request, res: Response) => {
  res.send('Debug mode is enabled!');
});

router.get('/init', async (req: Request, res: Response) => {
  const numAccounts = parseInt(req.query.num_accounts);

  if (!numAccounts) {
    res.status(400).json({ error: 'Must specify num_accounts param.' });
    return;
  }

  debugTeamUsernames = Object.freeze(
    Array.from({ length: numAccounts }, (_, i) => `debug${i}`)
  );

  let division = await DivisionDao.getByField('name', 'Debug');

  if (!division) {
    division = await DivisionDao.addOrUpdate({
      _id: undefined,
      name: 'Debug',
      type: DivisionType.Special,
      starterCode: [],
    });
  }

  await TeamDao.deleteAllByField('username', debugTeamUsernames);
  const teams = await TeamDao.addMany(
    debugTeamUsernames.map(username => ({
      members: undefined,
      division,
      username,
      password: '',
      salt: '',
    }))
  );

  res.send(teams);
});

router.get('/deinit', async (req: Request, res: Response) => {
  await TeamDao.deleteAllByField('username', debugTeamUsernames);
  res.send({ success: true });
});

export default router;

import * as Router from 'koa-router';
import { TeamDao } from '../daos/team.dao';
import { DivisionDao } from '../daos/division.dao';
import { DivisionType } from '@codelm/common/src/models/division.model';
import { PermissionsUtil } from '../permissions.util';

let debugTeamUsernames: readonly string[];

const router = new Router();
router.use(PermissionsUtil.requireDebugMode);

router.get('/', ctx => {
  ctx.body = 'Debug mode is enabled!';
});

router.get('/init', async ctx => {
  const numAccounts = parseInt(ctx.query.num_accounts);

  if (!numAccounts) {
    ctx.status = 400;
    ctx.body = { error: 'Must specify num_accounts param.' };
    return;
  }

  debugTeamUsernames = Object.freeze(
    Array.from({ length: numAccounts }, (_, i) => `debug${i}`)
  );

  let division = await DivisionDao.getDivisionByName('Debug');

  if (!division) {
    division = await DivisionDao.addOrUpdateDivision({
      _id: undefined,
      name: 'Debug',
      type: DivisionType.Special,
      starterCode: [],
    });
  }

  await TeamDao.deleteTeams(debugTeamUsernames);
  const teams = await TeamDao.createTeams(
    debugTeamUsernames.map(username => ({
      members: undefined,
      division,
      username,
      password: '',
      salt: '',
    }))
  );

  ctx.body = teams;
});

router.get('/deinit', async ctx => {
  await TeamDao.deleteTeams(debugTeamUsernames);
  ctx.body = { success: true };
});

export default router;

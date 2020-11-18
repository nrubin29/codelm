import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { DivisionDao } from '../daos/division.dao';
import {
  DivisionModel,
  DivisionType,
} from '@codelm/common/src/models/division.model';
import { PermissionsUtil } from '../permissions.util';
import { SettingsState } from '@codelm/common/src/models/settings.model';
import * as shortid from 'shortid';
import * as fs from 'fs-extra';

const router = new Router();

// This endpoint returns Competition divisions for non-admins to support the
// possibility of Group sponsor accounts. If this feature isn't implemented,
// this endpoint can be locked down to just admins.
router.get('/', PermissionsUtil.requestAuth, async ctx => {
  let divisions: DivisionModel[];

  if (ctx.state.admin) {
    divisions = await DivisionDao.getDivisions();
  } else {
    divisions = await DivisionDao.getDivisionsOfType(DivisionType.Competition);
  }

  ctx.body = divisions;
});

router.put('/', PermissionsUtil.requireSuperUser, koaBody(), async ctx => {
  const division: DivisionModel & { states: string[] } = ctx.request.body;

  if (!division.states) {
    division.states = [];
  }

  if ((typeof division.states as any) === 'string') {
    division.states = [division.states as any];
  }

  if (!division.starterCode) {
    division.starterCode = [];
  }

  const files = ctx.request.files ?? {};

  for (let state of Object.keys(files)) {
    const file = shortid();
    await fs.move(files[state].path, `files/startercode/${file}.zip`);
    division.starterCode.push({ state: SettingsState[state], file });
  }

  if (division._id) {
    const oldDivision = await DivisionDao.getDivision(division._id);

    // We need to delete any files that...
    for (const sc of oldDivision.starterCode.filter(
      sc =>
        Object.keys(files).includes(sc.state) || // we are trying to overwrite, or
        !division.states.includes(sc.state) // we are trying to delete.
    )) {
      await fs.unlink(`files/startercode/${sc.file}.zip`);
    }

    // We want to keep all previously uploaded files that...
    division.starterCode = division.starterCode.concat(
      oldDivision.starterCode.filter(
        oldSC =>
          !Object.keys(files).includes(oldSC.state.toString()) && // we aren't trying to overwrite, and
          division.states.includes(oldSC.state.toString()) // we aren't trying to delete.
      )
    );
  }

  delete division.states;

  const updatedDivision = await DivisionDao.addOrUpdateDivision(division);
  ctx.body = updatedDivision;
});

router.delete('/:id', PermissionsUtil.requireSuperUser, async ctx => {
  await DivisionDao.deleteDivision(ctx.params.id);
  ctx.body = true;
});

export default router;

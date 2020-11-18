import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { ProblemDao, sanitizeProblem } from '../daos/problem.dao';
import {
  ProblemModel,
  ProblemType,
} from '@codelm/common/src/models/problem.model';
import { PermissionsUtil } from '../permissions.util';
import { SettingsDao } from '../daos/settings.dao';
import { SettingsState } from '@codelm/common/src/models/settings.model';
import { TeamUtil } from '@codelm/common/src/utils/team.util';

const router = new Router();

router.put('/', PermissionsUtil.requireSuperUser, koaBody(), async ctx => {
  ctx.body = await ProblemDao.addOrUpdateProblem(
    ctx.request.body as ProblemModel
  );
});

router.get('/:id', PermissionsUtil.requireAuth, async ctx => {
  let problem = await ProblemDao.getProblem(ctx.params.id);

  if (!ctx.state.admin) {
    problem = sanitizeProblem(problem);
  }

  ctx.body = problem;
});

router.delete('/:id', PermissionsUtil.requireSuperUser, async ctx => {
  await ProblemDao.deleteProblem(ctx.params.id);
  ctx.body = true;
});

router.get('/division/:id', PermissionsUtil.requireAuth, async ctx => {
  let problems = await ProblemDao.getProblemsForDivision(ctx.params.id);
  const settings = await SettingsDao.getSettings();

  if (!ctx.state.admin) {
    problems = problems.filter(
      problem =>
        problem.divisions.findIndex(
          pD =>
            pD.division._id.toString() ===
            ctx.params.team.division._id.toString()
        ) !== -1
    );

    if (!TeamUtil.isSpecial(ctx.state.team)) {
      if (settings.state === SettingsState.Graded) {
        problems = problems.filter(
          problem =>
            settings.state === SettingsState.Graded &&
            problem.type === ProblemType.Graded
        );
      } else if (settings.state === SettingsState.Upload) {
        problems = problems.filter(
          problem =>
            settings.state === SettingsState.Upload &&
            problem.type === ProblemType.OpenEnded
        );
      }
    }

    problems.forEach(problem => sanitizeProblem(problem));
  }

  ctx.body = problems;
});

export default router;

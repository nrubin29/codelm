import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { TeamDao } from '../daos/team.dao';
import { PermissionsUtil } from '../permissions.util';

const router = new Router();

router.get('/', PermissionsUtil.requireTeam, ctx => {
  ctx.body = ctx.state.team;
});

router.get('/:id', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await TeamDao.getTeam(ctx.params.id);
});

router.put('/', PermissionsUtil.requireAdmin, koaBody(), async ctx => {
  ctx.body = await TeamDao.addOrUpdateTeam(ctx.request.body);
});

router.delete('/:id', PermissionsUtil.requireAdmin, async ctx => {
  await TeamDao.deleteTeam(ctx.params.id);
  ctx.body = true;
});

router.get('/division/:id', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await TeamDao.getTeamsForDivision(ctx.params.id);
});

export default router;

import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { PermissionsUtil } from '../permissions.util';
import { GroupDao } from '../daos/group.dao';
import { GroupModel } from '@codelm/common/src/models/group.model';

const router = new Router();

router.get('/', PermissionsUtil.requestAuth, async ctx => {
  let groups: GroupModel[];

  if (ctx.state.admin) {
    groups = await GroupDao.getGroups();
  } else {
    groups = await GroupDao.getNonSpecialGroups();
  }

  ctx.body = groups;
});

router.put('/', PermissionsUtil.requireAdmin, koaBody(), async ctx => {
  ctx.body = await GroupDao.addOrUpdateGroup(ctx.request.body);
});

router.delete('/:id', PermissionsUtil.requireAdmin, async ctx => {
  await GroupDao.deleteGroup(ctx.params.id);
  ctx.body = true;
});

export default router;

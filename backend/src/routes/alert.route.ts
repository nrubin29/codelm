import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { AlertDao } from '../daos/alert.dao';
import { PermissionsUtil } from '../permissions.util';

const router = new Router();

router.get('/', async ctx => {
  ctx.body = await AlertDao.getAlerts();
});

router.put('/', PermissionsUtil.requireSuperUser, koaBody(), async ctx => {
  ctx.body = await AlertDao.addOrUpdateAlert(ctx.request.body);
});

router.delete('/:id', PermissionsUtil.requireSuperUser, async ctx => {
  await AlertDao.deleteAlert(ctx.params.id);
  ctx.body = true;
});

export default router;

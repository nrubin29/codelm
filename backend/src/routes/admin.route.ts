import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { AdminDao } from '../daos/admin.dao';
import { PermissionsUtil } from '../permissions.util';

const router = new Router();
router.use(PermissionsUtil.requireSuperUser);

router.get('/', async ctx => {
  ctx.body = await AdminDao.getAdmins();
});

router.put('/', koaBody(), async ctx => {
  ctx.body = await AdminDao.addOrUpdateAdmin(ctx.request.body);
});

router.delete('/:id', async ctx => {
  await AdminDao.deleteAdmin(ctx.params.id);
  ctx.body = true;
});

export default router;

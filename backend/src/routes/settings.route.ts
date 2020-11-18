import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { SettingsDao } from '../daos/settings.dao';
import { PermissionsUtil } from '../permissions.util';

const router = new Router();

router.get('/', async ctx => {
  ctx.body = await SettingsDao.getSettings();
});

router.put('/', PermissionsUtil.requireSuperUser, koaBody(), async ctx => {
  ctx.body = await SettingsDao.updateSettings(ctx.request.body);
});

router.delete('/', PermissionsUtil.requireSuperUser, async ctx => {
  await SettingsDao.resetSettings();
  ctx.body = true;
});

export default router;

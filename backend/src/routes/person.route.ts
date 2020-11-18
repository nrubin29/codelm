import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import { PermissionsUtil } from '../permissions.util';
import { PersonDao, sanitizePerson } from '../daos/person.dao';

const router = new Router();

router.get('/', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await PersonDao.getPeople();
});

router.get('/group/:groupId', PermissionsUtil.requireAdmin, async ctx => {
  ctx.body = await PersonDao.getPeopleForGroup(ctx.params.groupId);
});

router.put('/', koaBody(), async ctx => {
  try {
    ctx.body = sanitizePerson(
      await PersonDao.addOrUpdatePerson(ctx.request.body)
    );
  } catch {
    // TODO: Standardize, type, and properly handle errors.
    ctx.body = {
      error: 'This email address or username is already registered.',
    };
  }
});

router.delete('/:id', PermissionsUtil.requireAdmin, async ctx => {
  await PersonDao.deletePerson(ctx.params.id);
  ctx.body = true;
});

export default router;

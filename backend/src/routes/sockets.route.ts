import * as Router from 'koa-router';
import { PermissionsUtil } from '../permissions.util';
import { SocketManager } from '../socket.manager';
import { SocketConnection } from '@codelm/common/src/models/sockets.model';

const router = new Router();
router.use(PermissionsUtil.requireSuperUser);

router.get('/:type', async ctx => {
  const sockets: SocketConnection[] = [];

  if (ctx.params.type === 'teams') {
    SocketManager.instance.teamSockets.forEach((_, _id) =>
      sockets.push({ _id })
    );
  } else {
    SocketManager.instance.adminSockets.forEach((_, _id) =>
      sockets.push({ _id })
    );
  }

  ctx.body = sockets;
});

router.delete('/:id', async ctx => {
  SocketManager.instance.kick(ctx.params.id);
  ctx.status = 200;
});

export default router;
